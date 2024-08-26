import type NodeCG from '@nodecg/types';
import { ChannelItem, Configschema, MixerState } from 'types/schemas';
import { MetaArgument, UDPPort } from 'osc';
import PQueue from 'p-queue';
import range from 'lodash/range';
import debounce from 'lodash/debounce';
import { ObsConnectorService } from '../ObsConnectorService';
import { X32Transitions } from './X32Transitions';

export class MixerService {
    private readonly logger: NodeCG.Logger;
    private readonly mixerState: NodeCG.ServerReplicantWithSchemaDefault<MixerState>;
    private readonly mixerAddress?: string;
    private osc: UDPPort | null;
    private subscriptionRenewalInterval: NodeJS.Timeout | undefined = undefined;
    private readonly requestQueue: PQueue = new PQueue({
        concurrency: 20,
        timeout: 500,
        throwOnTimeout: true
    });
    private inFlightRequests: Record<string, () => void> = { };
    private readonly oscState: Map<string, MetaArgument[]> = new Map();
    private readonly debouncedUpdateStateReplicant: () => void;
    private readonly transitions: X32Transitions;
    private readonly muteTransitionDuration: number;
    private readonly unmuteTransitionDuration: number;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>, obsConnectorService: ObsConnectorService) {
        this.mixerState = nodecg.Replicant('mixerState') as unknown as NodeCG.ServerReplicantWithSchemaDefault<MixerState>;
        this.logger = new nodecg.Logger(`${nodecg.bundleName}:MixerService`);
        this.unmuteTransitionDuration = nodecg.bundleConfig.x32?.transitionDurations?.unmute ?? 500;
        this.muteTransitionDuration = nodecg.bundleConfig.x32?.transitionDurations?.mute ?? 500;
        this.debouncedUpdateStateReplicant = debounce(this.updateStateReplicant, 100, {
            maxWait: 500,
            trailing: true,
            leading: false
        });

        this.osc = null;
        if (MixerService.hasRequiredConfig(nodecg)) {
            this.mixerAddress = nodecg.bundleConfig.x32!.address!;
            this.setupSocket();
        } else {
            this.mixerState.value.connectionState = 'NOT_CONNECTED';
            this.logger.warn('Some X32 mixer configuration is missing!');
        }

        this.transitions = new X32Transitions(nodecg);
        const channelMapping = nodecg.bundleConfig.x32?.channelMapping;
        if (channelMapping != null) {
            obsConnectorService.addProgramSceneChangeListener(sceneName => {
                if (ObsConnectorService.sceneNameTagPresent('G', sceneName)) {
                    channelMapping.games?.forEach(gameChannel => {
                        this.transitions.run(this.channelItemToFaderPath(gameChannel), 0, 1, this.unmuteTransitionDuration, 'out');
                    });
                } else {
                    channelMapping.games?.forEach(gameChannel => {
                        this.transitions.run(this.channelItemToFaderPath(gameChannel), 1, 0, this.muteTransitionDuration, 'in');
                    });
                }

                if (ObsConnectorService.sceneNameTagPresent('R', sceneName)) {
                    channelMapping.runners?.forEach(runnerChannel => {
                        this.transitions.run(this.channelItemToFaderPath(runnerChannel), 0, 1, this.unmuteTransitionDuration, 'out');
                    });
                } else {
                    channelMapping.runners?.forEach(runnerChannel => {
                        this.transitions.run(this.channelItemToFaderPath(runnerChannel), 1, 0, this.muteTransitionDuration, 'in');
                    });
                }
            });
        }
    }

    private setupSocket() {
        this.mixerState.value.connectionState = 'CONNECTING';

        this.osc = new UDPPort({
            localAddress: '0.0.0.0',
            localPort: 0,
            broadcast: true,
            metadata: true,
            remoteAddress: this.mixerAddress,
            remotePort: 10023
        });
        this.osc.on('error', err => {
            this.logger.error(`X32 socket error: ${err.message}`);
            this.requestQueue.clear();
            this.inFlightRequests = { };
        });
        this.osc.on('close', () => {
            this.logger.warn('X32 connection closed');
            this.mixerState.value.connectionState = 'NOT_CONNECTED';
            clearInterval(this.subscriptionRenewalInterval);
        });
        this.osc.on('ready', () => {
            this.mixerState.value.connectionState = 'CONNECTED';

            this.requestQueue.clear();
            this.inFlightRequests = { };

            this.registerForUpdates();
            clearInterval(this.subscriptionRenewalInterval);
            this.subscriptionRenewalInterval = setInterval(() => {
                this.registerForUpdates();
            }, 8000);

            const requiredState = [
                ...this.getChannelNameAddresses(),
                ...this.getAuxInNameAddresses(),
                ...this.getFxReturnNameAddresses(),
                ...this.getBusNameAddresses(),
                ...this.getMatrixNameAddresses(),
                ...this.getDCANameAddresses(),
                '/main/st/config/name',
                '/main/m/config/name'
            ];
            requiredState.forEach(address => {
                this.queueEnsureLoaded(address);
            });
        });
        this.osc.on('message', message => {
            this.oscState.set(message.address, message.args as MetaArgument[]);
            if (this.inFlightRequests[message.address]) {
                this.inFlightRequests[message.address]();
                delete this.inFlightRequests[message.address];
            }
            if (message.address.endsWith('/config/name')) {
                this.debouncedUpdateStateReplicant();
            }
        });
        this.osc.open();
    }

    private updateStateReplicant() {
        const findName = (address: string): string | undefined => {
            const stateItem = this.oscState.get(address);
            const value = stateItem != null && stateItem[0].type === 's' ? stateItem[0].value as string : undefined;
            return value?.length === 0 ? undefined : value;
        }

        this.mixerState.value = {
            connectionState: this.mixerState.value.connectionState,
            mainLRName: findName('/main/st/config/name') ?? 'LR',
            mainMonoName: findName('/main/m/config/name') ?? 'M/C',
            channelNames: this.getChannelNameAddresses().map((address, i) => findName(address) ?? `Ch ${String(i + 1).padStart(2, '0')}`),
            auxInNames: this.getAuxInNameAddresses().map((address, i) => findName(address) ?? `Aux ${i + 1}`),
            fxReturnNames: this.getFxReturnNameAddresses().map((address, i) => findName(address) ?? `Fx ${Math.floor(i / 2) + 1}${i % 2 === 0 ? 'L' : 'R'}`),
            busNames: this.getBusNameAddresses().map((address, i) => findName(address) ?? `Bus ${i + 1}`),
            matrixNames: this.getMatrixNameAddresses().map((address, i) => findName(address) ?? `Matrix ${i + 1}`),
            dcaNames: this.getDCANameAddresses().map((address, i) => findName(address) ?? `DCA ${i + 1}`)
        };
    }

    private getChannelNameAddresses(): string[] {
        return range(1, 33).map(i => `/ch/${String(i).padStart(2, '0')}/config/name`);
    }
    private getAuxInNameAddresses(): string[] {
        return range(1, 9).map(i => `/auxin/0${i}/config/name`);
    }
    private getFxReturnNameAddresses(): string[] {
        return range(1, 9).map(i => `/fxrtn/0${i}/config/name`);
    }
    private getBusNameAddresses(): string[] {
        return range(1, 17).map(i => `/bus/${String(i).padStart(2, '0')}/config/name`);
    }
    private getMatrixNameAddresses(): string[] {
        return range(1, 7).map(i => `/mtx/0${i}/config/name`);
    }
    private getDCANameAddresses(): string[] {
        return range(1, 9).map(i => `/dca/${i}/config/name`);
    }

    private registerForUpdates() {
        if (this.osc == null) return;
        this.osc.send({ address: '/xremote', args: [] });
    }

    private queueEnsureLoaded(path: string) {
        if (this.osc == null) return;
        this.requestQueue.add(async () => {
            if (this.inFlightRequests[path] || this.oscState.has(path)) return;

            const p = new Promise<void>(resolve => {
                this.inFlightRequests[path] = resolve;
            });

            this.osc!.send({
                address: path,
                args: []
            });

            await p;
        }).catch(e => {
            delete this.inFlightRequests[path];
            this.logger.error(`OSC request failed at path ${path}: ${'message' in e ? e.message : String(e)}`);
        });
    }

    private channelItemToFaderPath(item: ChannelItem): string {
        switch (item.type) {
            case 'AUX_IN':
            case 'BUS':
            case 'CHANNEL':
            case 'FX_RETURN':
            case 'MATRIX':
                const base = {
                    'AUX_IN': '/auxin/',
                    'BUS': '/bus/',
                    'CHANNEL': '/ch/',
                    'FX_RETURN': '/fxrtn/',
                    'MATRIX': '/mtx/'
                }[item.type];
                return `${base}${String(item.number).padStart(2, '0')}/mix/fader`;
            case 'DCA':
                return `/dca/${item.number}/fader`;
        }
    }

    static hasRequiredConfig(nodecg: NodeCG.ServerAPI<Configschema>) {
        return nodecg.bundleConfig.x32?.address != null;
    }
}
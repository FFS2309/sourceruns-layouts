import type NodeCG from '@nodecg/types';
import type {
    AllBids,
    AllPrizes,
    Configschema,
    CurrentBids,
    CurrentPrizes,
    DonationTotal,
    Milestones
} from 'types/schemas';
import { TrackerClient } from '../clients/TrackerClient';
import { TrackerSocketClient } from '../clients/TrackerSocketClient';

export class TrackerService {
    private readonly nodecg: NodeCG.ServerAPI<Configschema>;
    private readonly logger: NodeCG.Logger;
    private readonly trackerClient?: TrackerClient;
    private readonly trackerSocketClient?: TrackerSocketClient;
    private readonly donationTotal: NodeCG.ServerReplicantWithSchemaDefault<DonationTotal>;
    private readonly allBids: NodeCG.ServerReplicantWithSchemaDefault<AllBids>;
    private readonly currentBids: NodeCG.ServerReplicantWithSchemaDefault<CurrentBids>;
    private readonly allPrizes: NodeCG.ServerReplicantWithSchemaDefault<AllPrizes>;
    private readonly currentPrizes: NodeCG.ServerReplicantWithSchemaDefault<CurrentPrizes>;
    private readonly milestones: NodeCG.ServerReplicantWithSchemaDefault<Milestones>;
    private donationTotalApiUpdateTimeout: NodeJS.Timeout | undefined = undefined;
    private isFirstLogin = true;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        this.logger = new nodecg.Logger(`${nodecg.bundleName}:TrackerService`);
        this.donationTotal = nodecg.Replicant('donationTotal') as unknown as NodeCG.ServerReplicantWithSchemaDefault<DonationTotal>;
        this.allBids = nodecg.Replicant('allBids') as unknown as NodeCG.ServerReplicantWithSchemaDefault<AllBids>;
        this.currentBids = nodecg.Replicant('currentBids') as unknown as NodeCG.ServerReplicantWithSchemaDefault<CurrentBids>;
        this.allPrizes = nodecg.Replicant('allPrizes') as unknown as NodeCG.ServerReplicantWithSchemaDefault<AllPrizes>;
        this.currentPrizes = nodecg.Replicant('currentPrizes') as unknown as NodeCG.ServerReplicantWithSchemaDefault<CurrentPrizes>;
        this.milestones = nodecg.Replicant('milestones') as unknown as NodeCG.ServerReplicantWithSchemaDefault<Milestones>;
        this.nodecg = nodecg;

        if (!TrackerClient.hasRequiredTrackerConfig(nodecg)) {
            this.logger.warn('Some GDQ tracker configuration is missing!');
        } else {
            this.trackerClient = new TrackerClient(nodecg);

            if (TrackerClient.hasTrackerLogin(nodecg)) {
                this.doLoginLoop();
            } else {
                this.logger.warn('GDQ tracker login info is not configured. Some privileged data will not be retrieved from the tracker.');
            }

            this.updateDonationTotal(true);
            this.pollTrackerData();
        }

        if (!TrackerSocketClient.hasRequiredConfig(nodecg)) {
            this.logger.warn('GDQ tracker socket URL is missing. Donations may take longer to appear on stream.');
        } else {
            this.trackerSocketClient = new TrackerSocketClient(nodecg);
            this.trackerSocketClient.start();
            this.trackerSocketClient.on('donation', this.onDonation.bind(this));
        }
    }

    private async pollTrackerData() {
        if (this.trackerClient == null) return;
        this.logger.debug('Updating GDQ tracker data');

        const results = await Promise.allSettled([
            this.trackerClient.getMilestones().then(milestones => { this.milestones.value = milestones; }),
            this.trackerClient.getBids(false).then(currentBids => { this.currentBids.value = currentBids; }),
            this.trackerClient.getBids(true).then(allBids => { this.allBids.value = allBids; }),
            this.trackerClient.getPrizes(false).then(currentPrizes => { this.currentPrizes.value = currentPrizes; }),
            this.trackerClient.getPrizes(true).then(allPrizes => { this.allPrizes.value = allPrizes; })
        ]);

        if (results.some(result => result.status === 'rejected')) {
            this.logger.error('Some GDQ tracker data failed to refresh');
            results.forEach(result => {
                if (result.status === 'rejected') {
                    this.logger.debug('Error refreshing GDQ tracker data:', result.reason);
                }
            });
        }
        this.logger.debug('Updated GDQ tracker data');
        setTimeout(this.pollTrackerData.bind(this), 60 * 1000);
    }

    private onDonation(amount: number, newTotal: number, displayName?: string | null) {
        if (this.donationTotal.value < newTotal) {
            this.donationTotal.value = newTotal;
        }
        this.nodecg.sendMessage('tracker:newDonation', {
            amount,
            displayName
        });
        if (this.donationTotalApiUpdateTimeout) {
            clearTimeout(this.donationTotalApiUpdateTimeout);
        }
        this.donationTotalApiUpdateTimeout = setTimeout(this.updateDonationTotal.bind(this), 60 * 1000);
    }

    private async doLoginLoop() {
        await this.trackerClient?.login()
            .then(() => {
                if (this.isFirstLogin) {
                    this.isFirstLogin = false;
                    this.logger.info('Successfully logged in to GDQ tracker');
                } else {
                    this.logger.debug('Successfully logged in to GDQ tracker');
                }
                setTimeout(this.doLoginLoop.bind(this), 90 * 60 * 1000);
            })
            .catch(e => {
                this.logger.error('Failed to log in to GDQ tracker:', e instanceof Error ? e.message : String(e));
                this.logger.debug('Failed to log in to GDQ tracker:', e);
                if (!this.isFirstLogin) {
                    setTimeout(this.doLoginLoop.bind(this), 60 * 1000);
                }
            });
    }

    private async updateDonationTotal(force = false) {
        try {
            if (this.trackerClient == null) return;
            const newTotal = await this.trackerClient.getDonationTotal();
            if (force || this.donationTotal.value < newTotal) {
                this.donationTotal.value = newTotal;
            }
        } catch (e) {
            this.logger.error('Error updating donation total:', e instanceof Error ? e.message : String(e));
            this.logger.debug('Error updating donation total:', e);
        } finally {
            this.donationTotalApiUpdateTimeout = setTimeout(this.updateDonationTotal.bind(this), 60 * 1000);
        }
    }
}
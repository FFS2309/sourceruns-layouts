import { BaseController } from './BaseController';
import type NodeCG from '@nodecg/types';
import type { Configschema, ObsConnectionInfo, ObsState } from 'types/schemas';
import { ObsConnectorService } from '../services/ObsConnectorService';

export class ObsConnectorController extends BaseController {
    constructor(nodecg: NodeCG.ServerAPI<Configschema>, obsConnectorService: ObsConnectorService) {
        super(nodecg);

        const obsConnectionInfo = nodecg.Replicant('obsConnectionInfo') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsConnectionInfo>;
        const obsState = nodecg.Replicant('obsState') as unknown as NodeCG.ServerReplicantWithSchemaDefault<ObsState>;

        this.listen('obs:connect', async (data) => {
            obsConnectionInfo.value = data;

            if (!obsState.value.enabled) {
                throw new Error('OBS websocket is disabled');
            }

            obsConnectorService.stopReconnecting();
            await obsConnectorService.connect();
        });

        this.listen('obs:setEnabled', async (data) => {
            obsState.value.enabled = data.enabled;
            if (!data.enabled) {
                await obsConnectorService.disconnect();
            } else {
                await obsConnectorService.connect();
            }
        });

        this.listen('obs:setConfig', async (data) => {
            if (
                obsState.value.scenes == null
                || [data.videoInputsScene, data.gameLayoutVideoFeedsScene].some(newScene => !!newScene && !obsState.value.scenes!.some(scene => scene === newScene))
            ) {
                throw new Error('Could not find one or more of the provided scenes');
            }

            await obsConnectorService.setConfig(data);
        });

        this.listen('obs:setCurrentScene', async (data) => {
            await obsConnectorService.setCurrentScene(data.sceneName);
        });

        this.listen('obs:getSourceScreenshot', async (data) => {
            return obsConnectorService.getSourceScreenshot(data.sourceName);
        });

        this.listen('obs:getSceneItemTransform', async (data) => {
            return obsConnectorService.getSceneItemTransform(data.sceneItemId, data.sceneName);
        });

        this.listen('obs:setSceneItemCrop', async (data) => {
            await obsConnectorService.setSceneItemCrop(data.sceneName, data.sceneItemId, data.crop);
        });

        /*this.listen('obs:getVLCPlaylistItem', async (data) => {
            return obsConnectorService.getInputSettings(data.inputName)?.playlist[0].value;
        });*/

        this.listen('obs:setVLCPlaylistItem', async (data) => {
           await obsConnectorService.setInputSettings(data.inputName, {playlist: [{hidden: false, selected: false, value: data.inputUrl}]});
        });

        this.listen('obs:setVideoInputAssignments', async (data) => {
            await obsConnectorService.setGameLayoutVideoFeedAssignments(data.type, data.assignments);
        });
    }
}

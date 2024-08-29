import type NodeCG from '@nodecg/types';
import { Configschema } from 'types/schemas';
import { ScheduleController } from './controllers/ScheduleController';
import { OengusClient } from './clients/OengusClient';
import { ScheduleService } from './services/ScheduleService';
import { TalentService } from './services/TalentService';
import { SpeedrunService } from './services/SpeedrunService';
import { SpeedrunController } from './controllers/SpeedrunController';
import { TalentController } from './controllers/TalentController';
import { TimerService } from './services/TimerService';
import { TimerController } from './controllers/TimerController';
import { ObsConnectorService } from './services/ObsConnectorService';
import { ObsConnectorController } from './controllers/ObsConnectorController';
import { LogController } from './controllers/LogController';
import { NameplateAssignmentService } from './services/NameplateAssignmentService';
import { TrackerService } from './services/TrackerService';
import { NameplateAssignmentController } from './controllers/NameplateAssignmentController';
import { TwitchService } from './services/TwitchService';
import { TwitchOauthClient } from './clients/TwitchOauthClient';
import { TwitchClient } from './clients/TwitchClient';
import { TwitchController } from './controllers/TwitchController';
import { MusicService } from './services/MusicService';
import { MixerService } from './services/mixer/MixerService';
import { OengusService } from './services/OengusService';
import { OengusController } from './controllers/OengusController';

export = (nodecg: NodeCG.ServerAPI<Configschema>): void => {
    const oengusClient = new OengusClient(nodecg);

    const hasTwitchConfig = TwitchOauthClient.hasRequiredConfig(nodecg);
    const twitchOauthClient = hasTwitchConfig ? new TwitchOauthClient(nodecg) : null;
    const twitchClient = twitchOauthClient ? new TwitchClient(nodecg, twitchOauthClient) : null;

    const timerService = new TimerService(nodecg);
    const talentService = new TalentService(nodecg);
    const scheduleService = new ScheduleService(nodecg, oengusClient, talentService, twitchClient);
    const speedrunService = new SpeedrunService(nodecg, scheduleService, timerService);
    scheduleService.init(speedrunService);
    const obsConnectorService = new ObsConnectorService(nodecg);
    new NameplateAssignmentService(nodecg);
    new TrackerService(nodecg);
    const twitchService = new TwitchService(nodecg, twitchOauthClient, twitchClient, talentService, scheduleService);
    new MusicService(nodecg, obsConnectorService);
    new MixerService(nodecg, obsConnectorService);
    const oengusService = new OengusService(nodecg, oengusClient);

    new ScheduleController(nodecg, scheduleService);
    new SpeedrunController(nodecg, speedrunService);
    new TalentController(nodecg, talentService);
    new TimerController(nodecg, timerService);
    new ObsConnectorController(nodecg, obsConnectorService);
    new LogController(nodecg);
    new NameplateAssignmentController(nodecg);
    new TwitchController(nodecg, twitchService);
    new OengusController(nodecg, oengusService);
};

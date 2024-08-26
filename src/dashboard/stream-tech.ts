import './styles/dashboard-common.scss';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setUpErrorHandler } from './helpers/ErrorHandlerStore';
import { installCommonHelpers } from 'client-shared/helpers/InstallCommonHelpers';
import { initInternalStatusStore } from 'client-shared/stores/InternalStatusStore';
import StreamTechPanel from './pages/stream-tech/StreamTechPanel.vue';
import { initScheduleStore } from 'client-shared/stores/ScheduleStore';
import { initTalentStore } from 'client-shared/stores/TalentStore';
import { initTimerStore } from 'client-shared/stores/TimerStore';
import { initObsStore } from 'client-shared/stores/ObsStore';
import { initTwitchDataStore } from 'client-shared/stores/TwitchDataStore';
import { initMusicStore } from 'client-shared/stores/MusicStore';
import { initMixerStore } from 'client-shared/stores/MixerStore';

(async () => {
    const app = createApp(StreamTechPanel);
    app.use(createPinia());
    setUpErrorHandler(app);
    installCommonHelpers(app, false);
    await Promise.all([
        initInternalStatusStore(),
        initScheduleStore(),
        initTalentStore(),
        initTimerStore(),
        initObsStore(),
        initTwitchDataStore(),
        initMusicStore(),
        initMixerStore()
    ]);
    app.mount('#app');
})();

<template>
    <ipl-space>
        <div class="title">System status</div>
        <div class="system-status-grid">
            <div>OBS</div>
            <div :class="`state-color-${obsState.color}`">
                {{ obsState.text }}
            </div>
            <div>Music</div>
            <div :class="`state-color-${musicState.color}`">
                {{ musicState.text }}
            </div>
            <div>Twitch</div>
            <div :class="`state-color-${twitchState.color}`">
                {{ twitchState.text }}
            </div>
            <div>Tracker websocket</div>
            <div :class="`state-color-${trackerSocketStatus.color}`">
                {{ trackerSocketStatus.text }}
            </div>
            <div>Tracker</div>
            <div :class="`state-color-${trackerLoginStatus.color}`">
                {{ trackerLoginStatus.text }}
            </div>
            <div>Mixer</div>
            <div :class="`state-color-${mixerStatus.color}`">
                {{ mixerStatus.text }}
            </div>
        </div>
    </ipl-space>
</template>

<script setup lang="ts">
import { IplSpace } from '@iplsplatoon/vue-components';
import { useObsStore } from 'client-shared/stores/ObsStore';
import { computed } from 'vue';
import { useMusicStore } from 'client-shared/stores/MusicStore';
import { Configschema } from 'types/schemas';
import { useTwitchDataStore } from 'client-shared/stores/TwitchDataStore';
import { useInternalStatusStore } from 'client-shared/stores/InternalStatusStore';
import { useMixerStore } from 'client-shared/stores/MixerStore';

const bundleConfig = nodecg.bundleConfig as Configschema;

const obsStore = useObsStore();
const obsState = computed(() => {
    if (!obsStore.obsState.enabled) {
        return {
            color: 'neutral',
            text: 'Disabled'
        };
    } else {
        switch (obsStore.obsState.status) {
            case 'CONNECTED':
                return {
                    color: 'green',
                    text: 'Connected'
                };
            case 'CONNECTING':
                return {
                    color: 'yellow',
                    text: 'Connecting'
                };
            case 'NOT_CONNECTED':
                return {
                    color: 'red',
                    text: 'Not connected'
                };
        }
    }
});

const musicStore = useMusicStore();
const musicState = computed(() => {
    if (bundleConfig?.foobar2000?.address == null) {
        return {
            color: 'neutral',
            text: 'Not configured'
        };
    } else {
        switch (musicStore.musicState.connectionState) {
            case 'CONNECTED':
                return {
                    color: 'green',
                    text: 'Connected'
                };
            case 'CONNECTING':
                return {
                    color: 'yellow',
                    text: 'Connecting'
                };
            case 'DISCONNECTED':
                return {
                    color: 'red',
                    text: 'Disconnected'
                };
        }
    }
});

const twitchDataStore = useTwitchDataStore();
const twitchState = computed(() => {
    if (bundleConfig?.twitch == null) {
        return {
            color: 'neutral',
            text: 'Not configured'
        };
    } else if (!twitchDataStore.twitchData.syncEnabled) {
        return {
            color: 'neutral',
            text: 'Sync disabled'
        };
    } else {
        switch (twitchDataStore.twitchData.state) {
            case 'AUTHENTICATING':
                return {
                    color: 'yellow',
                    text: 'Authenticating'
                };
            case 'LOGGED_IN':
                return {
                    color: 'green',
                    text: 'Logged in'
                };
            case 'NOT_LOGGED_IN':
                return {
                    color: 'red',
                    text: 'Not logged in'
                };
        }
    }
});

const internalStatusStore = useInternalStatusStore();
const trackerSocketStatus = computed(() => {
    if (bundleConfig?.tracker?.socketAddress == null) {
        return {
            color: 'neutral',
            text: 'Not configured'
        };
    } else {
        switch (internalStatusStore.trackerState.donationSocket) {
            case 'CONNECTED':
                return {
                    color: 'green',
                    text: 'Connected'
                };
            case 'CONNECTING':
                return {
                    color: 'yellow',
                    text: 'Connecting'
                };
            case 'NOT_CONNECTED':
                return {
                    color: 'red',
                    text: 'Not connected'
                };
        }
    }
});
const trackerLoginStatus = computed(() => {
    if ((bundleConfig?.tracker?.password == null || bundleConfig?.tracker?.username == null) && (bundleConfig?.tiltify?.clientId == null || bundleConfig?.tiltify?.clientSecret == null)) {
        return {
            color: 'neutral',
            text: 'Not configured'
        };
    } else {
        switch (internalStatusStore.trackerState.login) {
            case 'LOGGED_IN':
                return {
                    color: 'green',
                    text: 'Logged in'
                };
            case 'LOGGING_IN':
                return {
                    color: 'yellow',
                    text: 'Logging in'
                };
            case 'NOT_LOGGED_IN':
                return {
                    color: 'red',
                    text: 'Not logged in'
                };
        }
    }
});

const mixerStore = useMixerStore();
const mixerStatus = computed(() => {
    if (bundleConfig?.x32?.address == null) {
        return {
            color: 'neutral',
            text: 'Not configured'
        };
    } else {
        switch (mixerStore.mixerState.connectionState) {
            case 'CONNECTED':
                return {
                    color: 'green',
                    text: 'Connected'
                };
            case 'CONNECTING':
                return {
                    color: 'yellow',
                    text: 'Connecting'
                };
            case 'NOT_CONNECTED':
                return {
                    color: 'red',
                    text: 'Not connected'
                };
        }
    }
});
</script>

<style scoped lang="scss">
@use '../../styles/dashboard-colors';

.system-status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    row-gap: 2px;

    > *:nth-child(even) {
        justify-self: end;
    }
}

.state-color-green {
    color: dashboard-colors.$state-green;
}
.state-color-yellow {
    color: dashboard-colors.$state-yellow;
    font-weight: 700;
}
.state-color-red {
    color: dashboard-colors.$state-red;
    font-weight: 700;
}
</style>

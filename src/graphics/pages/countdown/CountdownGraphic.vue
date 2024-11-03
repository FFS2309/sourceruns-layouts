<template>
    <div class="countdown-wrapper layout vertical center-vertical center-horizontal">
        <img
            src="../../assets/img/large-logo.png"
            class="event-logo"
        >
        <opacity-swap-transition>
            <fitted-content
                :max-width="1200"
                class="message"
                align="center"
                :key="countdownStore.countdownData.messageText"
            >
                {{ countdownStore.countdownData.messageText }}
            </fitted-content>
        </opacity-swap-transition>
        <div class="bg-inset countdown">
            <seven-segment-digits
                unlit-segment="00:00:00"
                :value="duration.value"
                :flash="duration.flash"
                always-lit-segment="!!!!!:!!"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCountdownStore } from 'client-shared/stores/CountdownStore';
import { computed } from 'vue';
import { Duration } from 'luxon';
import OpacitySwapTransition from 'components/OpacitySwapTransition.vue';
import FittedContent from 'components/FittedContent.vue';
import SevenSegmentDigits from 'components/SevenSegmentDigits.vue';
import { padNumber } from 'client-shared/helpers/StringHelper';

const countdownStore = useCountdownStore();
const duration = computed(() => {
    const parsedDuration = Duration.fromMillis(countdownStore.countdownTimer).shiftTo('hours', 'minutes', 'seconds', 'milliseconds');
    if (parsedDuration.hours > 0) {
        return {
            value: `${Math.min(99, parsedDuration.hours)}:${padNumber(parsedDuration.minutes)}:${padNumber(parsedDuration.seconds)}`,
            flash: false
        };
    } else {
        return {
            value: `${padNumber(parsedDuration.minutes)}:${padNumber(parsedDuration.seconds)}`,
            flash: parsedDuration.milliseconds === 0
        };
    }
});
</script>

<style scoped lang="scss">
@use '../../styles/constants';

.countdown-wrapper {
    height: calc(100% - constants.$omnibarHeight);
    background: url("../../assets/img/background.png");
    background-size: cover;
}

.event-logo {
    height: 350px;
}

.message {
    margin-top: 24px;
    color: white;
    font-weight: 700;
    font-size: 64px;
}

.countdown {
    margin-top: 24px;
    font-size: 56px;
}
</style>

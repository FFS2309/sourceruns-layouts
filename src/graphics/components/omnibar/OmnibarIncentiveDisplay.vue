<template>
    <div class="omnibar-milestone-display">
        <div class="first-row">
            <fitted-content class="incentive-name m-r-8">
                <span v-if="!$helpers.isBlank(props.incentive.speedrunName)" class="speedrun-name">{{ props.incentive.speedrunName }} - </span>{{ props.incentive.name }}
            </fitted-content>
            <div>${{ formatNumber(props.incentive.total) }}/<span class="incentive-total">${{ props.incentive.goal == null ? '-' : formatNumber(props.incentive.goal) }}</span></div>
        </div>
        <progress class="milestone-progress" :max="props.incentive.goal ?? 0" :value="props.incentive.total"></progress>

        <!--<vfd-pixel-text
            :font-size="24"
            text-align="left"
            :progress-bar="{ current: props.incentive.total, start: 0, end: props.incentive.goal ?? 0, showStartEnd: false }"
        />-->
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { CurrentBids } from 'types/schemas';
import { formatNumber } from 'client-shared/helpers/StringHelper';
import FittedContent from 'components/FittedContent.vue';

const props = defineProps<{
    incentive: CurrentBids[number]
}>();
</script>

<style scoped lang="scss">
@use '../../styles/colors';

.speedrun-name {
    font-weight: 400;
}

.omnibar-milestone-display {
    width: 98%;
}

.first-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: colors.$vfd-teal;
    font-size: 25px;
}

.incentive-total, .incentive-name {
    font-weight: 700;
}



.milestone-progress {
  width: 100%;
  height: 25px;
}


progress
{
  appearance: none;
}

progress::-webkit-progress-bar {
  background-color: colors.$hl-green-light;
  border: 2px solid colors.$hl-grey;
}

progress::-webkit-progress-value {
  background-color: colors.$hl-hud-text-color;
}
</style>

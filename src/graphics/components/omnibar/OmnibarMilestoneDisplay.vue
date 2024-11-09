<template>
    <div class="omnibar-milestone-display">
        <div class="first-row">
            <fitted-content class="milestone-name m-r-8">
                {{ props.milestone.name }}
            </fitted-content>
            <div>{{ formatNumber(donationStore.donationTotal) }}/<span class="milestone-total">{{ formatNumber(props.milestone.amount) }}$</span></div>
        </div>
        <progress class="milestone-progress" :max="props.milestone.amount - props.milestone.start" :value="Math.floor(donationStore.donationTotal)"></progress>
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { Milestones } from 'types/schemas';
import { formatNumber } from '../../../client-shared/helpers/StringHelper';
import { useDonationStore } from 'client-shared/stores/DonationStore';
import FittedContent from 'components/FittedContent.vue';

const donationStore = useDonationStore();

const props = defineProps<{
    milestone: Milestones[number]
}>();
</script>

<style scoped lang="scss">
@use '../../styles/colors';

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

.milestone-total, .milestone-name {
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

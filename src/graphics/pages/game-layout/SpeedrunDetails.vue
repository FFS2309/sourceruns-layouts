<template>
    <div>
        <div class="table-header layout horizontal center-vertical">
          <span>Game</span><span style="width: 30%">System</span><span>Category</span><span style="width: 20%;">Est.</span>
        </div>
        <div class="layout horizontal center-vertical speedrun-details">
          <span style="font-size: 16px; text-align: left; width: 100%">{{scheduleStore.activeSpeedrun?.title}}</span>
          <span style="font-size: 16px; text-align: left; width: 30%">{{systemAndReleaseYear}}</span>
          <span style="font-size: 16px; text-align: left; width: 100%">{{scheduleStore.activeSpeedrun?.category}}</span>
          <span style="font-size: 16px; text-align: left; width: 20%">{{scheduleStore.activeSpeedrun?.estimate.replace('PT', '')}}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import VfdPixelText from 'components/VfdPixelText.vue';
import { useScheduleStore } from 'client-shared/stores/ScheduleStore';
import { computed } from 'vue';
import { isBlank } from 'client-shared/helpers/StringHelper';
import SpeedrunEstimateDisplay from 'components/SpeedrunEstimateDisplay.vue';

const scheduleStore = useScheduleStore();

const systemAndReleaseYear = computed(() =>
    [scheduleStore.activeSpeedrun?.system, scheduleStore.activeSpeedrun?.releaseYear].filter(item => !isBlank(item)).join('·'));
</script>

<style scoped lang="scss">
@use '../../styles/colors';
@use '../../styles/decorations';

.speedrun-details {
      padding-top: 6px;
      padding-bottom: 6px;
      background-color: colors.$hl-panel-background;
}

.speedrun-title {
    margin-top: -4px;
}

.table-header {
  width: 100%;
  //margin-bottom: 12px;
  background-color: colors.$hl-background-green;
  //box-shadow: 2px 0 0 2px colors.$hl-panel-background;
  border-bottom: 2px solid colors.$hl-shadow;

  span {
    border-left: 1px solid colors.$hl-highlight;
    border-top: 2px solid colors.$hl-highlight;
    border-right: 2px solid colors.$hl-shadow;
    background-color: colors.$hl-background-green;
    font-weight: 400;
    text-transform: uppercase;
    font-size: 14px;
    padding: 2px 12px;
    width: 100%;
  }
}
</style>

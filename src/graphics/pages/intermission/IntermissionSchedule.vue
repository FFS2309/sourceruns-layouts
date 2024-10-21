<template>
    <div class="tab">
      <div class="title">
        <span>Next Up</span>
      </div>
      <div class="table-header layout horizontal center-vertical">
        <span>Game</span><span>Runner</span><span>Category</span><span style="width: 30%;">Estimate</span><span style="width: 30%;">Players</span>
      </div>
      <div class="intermission-schedule">
        <template
            v-for="(item, i) in nextScheduleItems"
        >
          <div class="schedule-item layout horizontal center-vertical">
            <template v-if="item != null">
              <span style="font-size: 16px; text-align: left; width: 100%">{{item.title}}</span>
                  <template v-if="item.type === 'SPEEDRUN'">
                    <span style="font-size: 16px; text-align: left; width: 100%">{{talentStore.formatSpeedrunTeamList(item.teams)}}</span>
                    <span style="font-size: 16px; text-align: left; width: 100%">{{item.category}}</span>
                    <span style="font-size: 16px; text-align: left; width: 30%">{{item.estimate.replace('PT', '')}}</span>
                    <span style="font-size: 16px; text-align: left; width: 30%">{{talentStore.getPlayerCountTeam(item.teams)}}/32</span>
                  </template>
                  <template v-else>
                    <span style="font-size: 16px; text-align: left; width: 100%">{{talentStore.formatTalentIdList(item.talentIds, 4)}}</span>
                    <span style="font-size: 16px; text-align: left; width: 100%"> </span>
                    <span style="font-size: 16px; text-align: left; width: 30%"> </span>
                    <span style="font-size: 16px; text-align: left; width: 30%">{{talentStore.getPlayerCountTalent(item.talentIds)}}/32</span>
                  </template>
            </template>
          </div>
        </template>
      </div>
    </div>
    <div class="schedule-notes layout vertical center-vertical center-horizontal max-width">
      <div class="m-b-8">Times are approximate.</div>
      <div class="layout horizontal center-vertical">
        <div class="full-schedule-label">Full Schedule</div>
        <div class="full-schedule-pointer-icon m-x-8">»</div>
        <div class="full-schedule-link">schedule.sourceruns.org</div>
      </div>
    </div>
</template>

<script setup lang="ts">
import {useScheduleStore} from 'client-shared/stores/ScheduleStore';
import {computed, ref, watchEffect} from 'vue';
import {ScheduleItem} from 'types/ScheduleHelpers';
import {useTimerStore} from 'client-shared/stores/TimerStore';
import {useTalentStore} from 'client-shared/stores/TalentStore';
import {Duration} from 'luxon';

const maxScheduleItemCount = 16;

const scheduleStore = useScheduleStore();
const timerStore = useTimerStore();
const talentStore = useTalentStore();

// When seeking to the next speedrun, the timer state may be reset before or after the active speedrun is changed.
// If the timer state is reset before the active speedrun is switched, the schedule may briefly flash an incorrect state before switching to the correct one.
// Due to this, we wait 50ms before fully committing to a schedule update to ensure no other state updates come in within that timeframe.
let scheduleUpdateTimeout: number | undefined = undefined;
const nextScheduleItems = ref<(ScheduleItem | null)[]>([null, null, null, null]);
watchEffect(() => {
    if (scheduleStore.activeSpeedrunIndex === -1) return [];

    let newNextScheduleItems: ScheduleItem[] = [];
    const interstitials: ScheduleItem[] = scheduleStore.interstitialsBeforeActiveRun.filter(interstitial => !interstitial.completed);
    if (interstitials.length >= maxScheduleItemCount) {
        newNextScheduleItems = interstitials.slice(0, maxScheduleItemCount);
    }
    if (timerStore.timer.state === 'FINISHED') {
        newNextScheduleItems = interstitials
            .concat(scheduleStore.schedule.items.slice(scheduleStore.activeSpeedrunIndex + 1, scheduleStore.activeSpeedrunIndex + 1 + maxScheduleItemCount - interstitials.length));
    } else {
        newNextScheduleItems = interstitials
            .concat(scheduleStore.activeSpeedrun!)
            .concat(scheduleStore.schedule.items.slice(scheduleStore.activeSpeedrunIndex + 1, scheduleStore.activeSpeedrunIndex + maxScheduleItemCount - interstitials.length));
    }
    if (newNextScheduleItems.length !== maxScheduleItemCount) {
        newNextScheduleItems = Array.from({ length: maxScheduleItemCount }, (_, i) => newNextScheduleItems[i] ?? null);
    }

    clearTimeout(scheduleUpdateTimeout);
    scheduleUpdateTimeout = window.setTimeout(() => nextScheduleItems.value = newNextScheduleItems, 50);
});

const scheduleItemTimeDeltas = computed(() => {
     let minutes = 0;
     const result: number[] = [];
     nextScheduleItems.value.forEach(scheduleItem => {
         if (scheduleItem == null) {
             result.push(minutes);
             return;
         }
         const parsedEstimate = Duration.fromISO(scheduleItem.estimate).shiftTo('minutes');
         const parsedSetupTime = Duration.fromISO(scheduleItem.setupTime ?? 'PT0M').shiftTo('minutes');
         minutes += parsedEstimate.minutes + parsedSetupTime.minutes;
         result.push(minutes);
     });
     return result;
});
</script>

<style scoped lang="scss">
@use '../../styles/colors';

.intermission-schedule {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: colors.$hl-panel-background;
    //border-top: 2px solid colors.$hl-shadow;
}
.bg-inset {
  padding: 0 8px 8px 8px;
}
.tab {
  border-left: 2px solid colors.$hl-highlight;
  border-right: 2px solid colors.$hl-highlight;
  border-bottom: 2px solid colors.$hl-shadow;
  background-color: colors.$hl-background-green;
}

.table-header {
  width: 100%;
  //margin-bottom: 12px;
  background-color: colors.$hl-panel-background;
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

.title {
    width: 100%;
    margin-bottom: 12px;
    //background-color: colors.$hl-panel-background;
    box-shadow: 2px 0 0 2px colors.$hl-background-green;
    border-bottom: 2px solid colors.$hl-highlight;

    span {
      //border-left: 2px solid colors.$hl-highlight;
      border-top: 2px solid colors.$hl-highlight;
      border-right: 2px solid colors.$hl-highlight;
      border-bottom: none;
        background-color: colors.$hl-background-green;
        color: colors.$hl-text-selected;
        font-weight: 400;
        text-transform: uppercase;
        font-size: 14px;
        padding: 2px 12px;
    }
}

.separator {
    width: 80%;
    height: 2px;
    background-color: colors.$vfd-teal;
    margin: 16px 0 16px 10%;
}

.schedule-item {
    /*width: 100%;
    min-height: 20px;
    margin-bottom: 12px;*/

  width: 100%;
  margin-bottom: 12px;
  //background-color: colors.$hl-panel-background;
  //box-shadow: 2px 0 0 2px colors.$hl-panel-background;
  //border-bottom: 2px solid colors.$hl-shadow;

  span {
    //border-left: 1px solid colors.$hl-highlight;
    //border-top: 2px solid colors.$hl-highlight;
    //border-right: 2px solid colors.$hl-shadow;
    //background-color: colors.$hl-background-green;
    font-weight: 400;
    text-transform: uppercase;
    font-size: 14px;
    padding: 2px 12px;
    width: 100%;
  }
}

.estimate-display {
    font-size: 1.2em;
}

.schedule-notes {
    color: colors.$vfd-teal;
    font-size: 28px;
    font-weight: 500;
    margin-top: -4px;
}

.full-schedule-pointer-icon {
    font-size: 42px;
    line-height: 35px;
    margin-top: -6px;
    font-weight: 400;
}

.full-schedule-label {
    background-color: colors.$hl-hud-bg-transparent;
    color: colors.$hl-hud-text-color;
    font-weight: 700;
    padding: 1px 12px;
    text-transform: uppercase;
    font-size: 25px;
}

.schedule-item-time-delta {
    width: 152px;
    align-items: flex-end;
    font-size: 22px;
    font-weight: 700;
    margin-left: 8px;

    .delta-digits {
        font-size: 44px;
    }

    .in {
        color: colors.$vfd-teal;
        margin-bottom: -2px;
        margin-right: 2px;
    }

    .unit {
        color: colors.$vfd-teal-unlit;
        transform: translateY(3.5px);
        font-size: 24px;
        line-height: 26px;

        &.lit {
            color: colors.$vfd-teal;
        }

        > .unlit {
            color: colors.$vfd-teal-unlit;
        }
    }
}
</style>

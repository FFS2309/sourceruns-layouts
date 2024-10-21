<template>
    <div
        class="intermission-layout"
        :class="{ 'with-visualizer-space': addVisualizerSpace }"
    >
        <div class="bg-panel bg-panel-jump blur-bg">
            <div class="layout horizontal logos u-non-blur">
                <img src="../../assets/img/large-logo.png">
                <media-box class="media-box" />
            </div>
            <div class="bg-inset m-t-16 layout vertical center-horizontal u-non-blur">
                <div class="header layout horizontal">
                  <span style="width: 100%; font-size: 16px">Donations</span>
                  <span style="width: 5%; font-size: 16px" class="button">X</span>
                </div>
                <div class="m-b-8 layout horizontal center-vertical">
                    <donation-total class="donation-total" />
                    <div class="pointer-icon">»</div>
                    <img
                        class="charity-logo"
                        src="../../assets/img/charity-logo-wide.png"
                    >
                </div>
            </div>
            <div class="bg-inset m-t-16 u-non-blur" style="overflow: hidden;">
              <div class="header layout horizontal">
                <span style="width: 100%; font-size: 16px">Omnibar</span>
                <span style="width: 5%; font-size: 16px" class="button">X</span>
              </div>
              <div style="height: 100px">
                <omnibar-slide-rotation
                    :slide-title-width="150"
                    without-donation-reminder
                    without-schedule-items

                />
              </div>
            </div>
            <div class="bg-inset m-t-16 layout vertical u-non-blur">
              <div class="header layout horizontal">
                <span style="width: 100%; font-size: 16px">Radio</span>
                <span style="width: 5%; font-size: 16px" class="button">X</span>
              </div>
                <div class="layout horizontal center-vertical">
                    <div
                        class="host-name-display layout vertical center-vertical center-horizontal"
                        :class="{ speaking: hostSpeaking }"
                    >
                        <template v-if="currentHost == null">
                            No Host!
                        </template>
                        <template v-else>
                            <fitted-content
                                class="host-name"
                                align="center"
                            >
                                {{ currentHost.name }}
                            </fitted-content>
                            <div
                                class="layout horizontal center-horizontal center-vertical m-t-2 max-width"
                                style="padding: 0 4px;"
                            >
                                <country-flag
                                    v-if="currentHost.countryCode != null"
                                    :country-code="currentHost.countryCode"
                                    class="host-flag"
                                />
                                <fitted-content class="host-pronoun-wrapper">
                                    <badge
                                        v-if="!isBlank(currentHost.pronouns)"
                                        class="host-pronouns"
                                    >
                                        {{ currentHost.pronouns }}
                                    </badge>
                                </fitted-content>
                            </div>
                        </template>
                        <div class="host-name-label">H</div>
                    </div>
                    <div class="music-icon">♫</div>
                    <div class="grow" style="height: 50px;">
                        <vfd-pixel-text
                            :font-size="22"
                            :text-content="musicStore.musicState.track?.artist ?? 'Unknown Artist'"
                            align="left"
                            text-align="left"
                        />
                        <vfd-pixel-text
                            :font-size="22"
                            :text-content="musicStore.musicState.track?.song ?? 'Unknown Song'"
                            align="left"
                            text-align="left"
                        />
                    </div>
                </div>
                <div
                    v-if="addVisualizerSpace"
                    style="height: 120px"
                />
            </div>
        </div>
        <large-separator direction="vertical" />
        <div class="bg-panel bg-panel-portal blur-bg">
          <div class="bg-inset u-non-blur">
            <div class="header layout horizontal">
              <span style="width: 100%; font-size: 16px">Schedule</span>
              <span style="width: 5%; font-size: 16px" class="button">X</span>
            </div>
            <intermission-schedule/>
          </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import IntermissionSchedule from './IntermissionSchedule.vue';
import MediaBox from 'components/MediaBox.vue';
import IntermissionPrizeDisplay from './IntermissionPrizeDisplay.vue';
import DonationTotal from 'components/DonationTotal.vue';
import OmnibarSlideRotation from 'components/omnibar/OmnibarSlideRotation.vue';
import { computed, provide } from 'vue';
import {
    MaxOmnibarBidWarItemsInjectionKey,
    MaxOmnibarBidWarTitleWidthInjectionKey
} from '../../../dashboard/helpers/Injections';
import FittedContent from 'components/FittedContent.vue';
import VfdPixelText from 'components/VfdPixelText.vue';
import { useTalentStore } from 'client-shared/stores/TalentStore';
import { isBlank } from 'client-shared/helpers/StringHelper';
import Badge from 'components/Badge.vue';
import CountryFlag from 'components/CountryFlag.vue';
import { useMusicStore } from 'client-shared/stores/MusicStore';
import { defaultSpeakingThreshold, disableVolumeMeters, useMixerStore } from 'client-shared/stores/MixerStore';
import { Configschema } from 'types/schemas';

const addVisualizerSpace = (nodecg.bundleConfig as Configschema).intermission?.addVisualizerSpace ?? false;

provide(MaxOmnibarBidWarItemsInjectionKey, 3);
provide(MaxOmnibarBidWarTitleWidthInjectionKey, 200);

const talentStore = useTalentStore();
const musicStore = useMusicStore();
const mixerStore = useMixerStore();
const currentHost = computed(() => talentStore.findTalentItemById(talentStore.currentHostId));

const hostSpeaking = computed(() => {
    if (disableVolumeMeters || talentStore.currentHostId == null) return false;
    const assignment = mixerStore.talentMixerChannelAssignments.host;
    if (assignment == null) return false;
    return (mixerStore.mixerChannelLevels[assignment.channelId] ?? -90) > (assignment.speakingThresholdDB ?? defaultSpeakingThreshold);
});
</script>

<style scoped lang="scss">
@use 'sass:color';
@use '../../styles/colors';



.header {
  width: 100%;
  margin-bottom: 22px;
  background-color: colors.$hl-panel-background;
  //box-shadow: 2px 0 0 2px colors.$hl-panel-background;
  //border-bottom: 2px solid colors.$hl-shadow;

  span {
    //border-left: 1px solid colors.$hl-highlight;
    //border-top: 2px solid colors.$hl-highlight;
    //border-right: 2px solid colors.$hl-shadow;
    background-color: colors.$hl-background-green;
    font-weight: 400;
    text-transform: uppercase;
    font-size: 14px;
    padding: 2px 12px;
    width: 100%;
    &.button {
      border-right: 2px solid colors.$hl-shadow;
      border-bottom: 2px solid colors.$hl-shadow;
      border-top: 2px solid colors.$hl-highlight;
      border-left: 2px solid colors.$hl-highlight
    }
  }
}

.intermission-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 14px minmax(0, 1fr);
    height: 100%;

    > .bg-panel {
        padding: 40px 50px;
        display: flex;
        flex-direction: column;
    }

    &.with-visualizer-space {
        .prize-display {
            height: 250px;
            margin-top: 32px;
        }

        .logos {
            margin-top: 0;

            img {
                width: 225px;
            }
        }
    }
}

.logos {
    justify-content: space-between;
    margin: 25px 60px 0;

    img {
        width: 250px;
    }

    .media-box {
        width: 400px;
        height: 100%;
    }
}

.prize-display {
    margin-top: 56px;
    height: 300px;
}

.donation-total {
    font-size: 1.5em;
}

.pointer-icon {
    color: colors.$vfd-teal;
    font-size: 3em;
    margin: 0 16px;
}

.charity-logo {
    height: 129px;
    margin: -8px 0;
}

.host-name-display {
    border: 2px solid colors.$vfd-teal;
    font-size: 30px;
    color: colors.$vfd-teal;
    font-weight: 700;
    position: relative;
    width: 250px;
    height: 73px;
    overflow: hidden;
    background-color: transparent;
    transition: background-color 150ms;

    &.speaking {
        background-color: color.adjust(colors.$vfd-teal, $alpha: -0.8);
    }

    > .host-name-label {
        font-family: 'Roboto Condensed', sans-serif;
        font-size: 20px;
        background-color: colors.$vfd-teal;
        color: colors.$vfd-background;
        position: absolute;
        bottom: 0;
        left: -2px;
        padding: 0 5px;
        min-width: 18px;
        height: 20px;
    }

    .host-name {
        padding: 0 4px;
        width: 100%;
        font-weight: 700;
    }

    .host-flag {
        height: 22px;
    }

    .host-flag + .host-pronoun-wrapper {
        margin-left: 4px;
    }

    .host-pronoun-wrapper {
        margin-top: -12px;
    }

    .host-pronouns {
        font-size: 16.25px !important;
        transform: translateY(1.5px);
    }
}

.music-icon {
    font-size: 60px;
    color: colors.$vfd-teal;
    margin: -4px 12px 0;
}
</style>

<template>
    <div class="layout-wrapper layout vertical">
        <div class="max-width layout horizontal layout-gap-bottom">
            <div
                class="game-capture"
                data-capture-index="0"
            >
                <team-result-display
                    :nameplate-index="0"
                    x-position="left"
                    y-position="bottom"
                />
            </div>
            <large-separator direction="vertical" />
            <div
                class="game-capture"
                data-capture-index="1"
            >
                <team-result-display
                    :nameplate-index="1"
                    x-position="right"
                    y-position="bottom"
                />
            </div>
        </div>
        <div class="other-content-row">
            <div class="column">
                <player-nameplate :index="0" />
                <div class="timer-wrapper bg-timer bg-panel layout vertical center-vertical grow blur-bg">
                    <div class="space-filler" />
                  <div class="bg-inset u-non-blur m-r-16">
                    <div class="header layout horizontal">
                      <span style="width: 100%; font-size: 16px">Timer</span>
                      <span style="width: 5%; font-size: 16px" class="button">X</span>
                    </div>
                    <speedrun-timer class="m-t-8"/>
                  </div>
                  <div class="bg-inset u-non-blur m-l-16">
                    <div class="header layout horizontal">
                      <span style="width: 100%; font-size: 16px">Run Details</span>
                      <span style="width: 5%; font-size: 16px" class="button">X</span>
                    </div>
                    <speedrun-details class="m-t-8" />
                  </div>
                    <div class="livesplit-logo-wrapper">
                        <img
                            src="../../../assets/img/lslogo-white.png"
                            class="livesplit-logo"
                        >
                    </div>
                </div>
            </div>
            <div
                class="camera-capture"
                data-capture-index="0"
            />
            <div class="bg-panel column">
                <player-nameplate :index="1" />
                <div class="bg-inset u-non-blur layout vertical grow">
                    <div class="header layout horizontal">
                      <span style="width: 100%; font-size: 16px">Host</span>
                      <span style="width: 5%; font-size: 16px" class="button">X</span>
                    </div>
                    <other-nameplate-grid class="m-t-12 m-x-16" />
                    <media-box class="grow m-x-8 m-y-8" />
                </div>
            </div>
        </div>
        <large-separator direction="horizontal" />
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import PlayerNameplate from '../PlayerNameplate.vue';
import SpeedrunDetails from '../SpeedrunDetails.vue';
import SpeedrunTimer from '../SpeedrunTimer.vue';
import OtherNameplateGrid from '../OtherNameplateGrid.vue';
import MediaBox from 'components/MediaBox.vue';
import TeamResultDisplay from '../TeamResultDisplay.vue';
</script>

<style scoped lang="scss">
@use '../../../styles/colors';

.game-capture {
    aspect-ratio: 16 / 9;
    width: 100%;
    position: relative;
    overflow: hidden;
}

.other-content-row {
    display: grid;
    grid-template-columns: 2.5fr 3fr 2.5fr;
    width: 100%;
    height: 100%;
}

.timer-wrapper {
    padding: 0 18px;
    position: relative;

    .space-filler {
        min-height: 18px;
        flex-basis: 90%;
    }

    > .bg-inset {
        width: 100%;
        height: 105px;
    }

    .livesplit-logo {
        width: 150px;
        opacity: 75%;
    }

    .livesplit-logo-wrapper {
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
}

.column {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-style: solid;
    border-width: 0 3px 3px 3px;
    border-color: colors.$layout-gap;
}
</style>

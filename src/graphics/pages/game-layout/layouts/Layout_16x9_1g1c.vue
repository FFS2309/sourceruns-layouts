<template>
    <div class="layout-wrapper">
        <div class="layout vertical">
            <div
                class="camera-capture layout-gap-bottom"
                data-capture-index="0"
            />
            <div class="max-height layout vertical bg-panel blur-bg center-vertical">
              <div class="bg-inset u-non-blur m-t-16 m-b-16">
                <div class="header layout horizontal">
                  <span style="width: 100%; font-size: 16px">Runners</span>
                  <span style="width: 5%; font-size: 16px" class="button">X</span>
                </div>
                <player-nameplate :index="0" :max-concurrent-players="4" class=""/>
              </div>
              <div class="bg-inset u-non-blur m-t-16 m-b-16">
                <div class="header layout horizontal">
                  <span style="width: 100%; font-size: 16px">Host</span>
                  <span style="width: 5%; font-size: 16px" class="button">X</span>
                </div>
                <other-nameplate-grid class="m-y-12 m-x-16" />
                <media-box class="grow m-b-12 m-x-12" />
              </div>
            </div>
        </div>
        <large-separator direction="vertical" />
        <div class="layout vertical">
            <div
                class="game-capture layout-gap-bottom max-height"
                data-capture-index="0"
            />
            <div class="timer-wrapper bg-panel bg-timer blur-bg layout horizontal center-vertical center-horizontal">
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
            </div>
        </div>
        <large-separator
            direction="horizontal"
            style="grid-column: span 3"
        />
    </div>
</template>

<script setup lang="ts">
import LargeSeparator from 'components/LargeSeparator.vue';
import PlayerNameplate from '../PlayerNameplate.vue';
import SpeedrunTimer from '../SpeedrunTimer.vue';
import SpeedrunDetails from '../SpeedrunDetails.vue';
import OtherNameplateGrid from '../OtherNameplateGrid.vue';
import MediaBox from 'components/MediaBox.vue';
</script>

<style scoped lang="scss">
@use '../../../styles/colors';

.layout-wrapper {
    display: grid;
    grid-template-columns: 445px 14px 1fr;
    grid-template-rows: 1fr 14px;
}

.camera-capture {
    aspect-ratio: 4 / 3;
    width: 100%;
}

.game-capture {
    aspect-ratio: 16 / 9;
    width: 100%;
}

.timer-wrapper > * {
    width: 580px;
    height: 110px;
}
</style>

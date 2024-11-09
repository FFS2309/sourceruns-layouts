<template>
  <ipl-dialog
      v-model:is-open="isOpen"
      class="streamkey-dialog"
  >
    <div
        class="layout horizontal max-width center-horizontal"
        style="max-width: 850px; margin: 8px 0 auto;"
    >
      <ipl-input
          v-model="streamKey"
          name="streamKey"
          label="Stream Key"
          style="max-width: 550px"
        />
      <ipl-button
          label="Apply"
          color="green"
          class="m-l-8"
          style="max-width: 100px"
          @click="apply"
      />
      <ipl-button
          label="Cancel"
          color="red"
          class="m-l-8"
          style="max-width: 100px"
          @click="isOpen = false"
      />
    </div>
  </ipl-dialog>
</template>

<script setup lang="ts">
import { IplButton, IplDialog, IplMessage, IplRadio, IplSpinner, IplInput } from '@iplsplatoon/vue-components';
import { onUnmounted, ref, watch } from 'vue';
import { sendMessage } from 'client-shared/helpers/NodecgHelper';
import { useObsStore } from 'client-shared/stores/ObsStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { VideoInputAssignment } from 'types/schemas';
import { ObsSceneItemTransform } from 'types/obs';

const streamKey = ref('');

const obsStore = useObsStore();
const isOpen = ref(false);
const selectedSourceName = ref<string | null>(null);
const selectedSceneItemId = ref<number | null>(null);

const selectedCapture = ref<{ type: 'camera' | 'game', index: number } | null>(null);

watch(isOpen, async (newValue) => {
    if (newValue && selectedSourceName.value != null && selectedSceneItemId.value != null) {
        //this.streamKey = await sendMessage('obs:getVLCPlaylistItem', {inputName: selectedSourceName.value});
    } else {

    }
});

onUnmounted(() => {
});

function open(inputAssignment: VideoInputAssignment, selectedCaptureData: { type: 'camera' | 'game', index: number }) {
    if (inputAssignment.sceneItemId == null) return;
    selectedCapture.value = selectedCaptureData;
    selectedSourceName.value = inputAssignment.sourceName;
    selectedSceneItemId.value = inputAssignment.sceneItemId;
    isOpen.value = true;
}

async function apply() {
    try {
        console.log(`StreamKey on apply: ${streamKey.value}`);
        if (selectedSourceName.value == null || streamKey.value == null) return;
        await sendMessage('obs:setVLCPlaylistItem', {
          inputName: selectedSourceName.value,
          inputUrl: `rtmp://eu-rtmp.speedrun.zip/live/${streamKey.value}`
        })
    } finally {
        isOpen.value = false;
    }
}

defineExpose({
    open
});
</script>

<style lang="scss">
.streamkey-dialog {
    width: 90vw;
    height: 90vh;
    overflow: hidden !important;

    > .content {
        box-sizing: border-box;
        overflow: hidden;
    }
}
</style>

<style scoped lang="scss">
.cropping-controls {
    position: sticky;
    left: 0;
    bottom: 0;
}
</style>

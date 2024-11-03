<template>
    <div
        ref="wrapper"
        class="vfd-pixel-text"
        :style="{
            fontSize: `${props.fontSize}px`,
            height: `${characterHeight}px`,
            textAlign: props.textAlign,
            justifyContent
        }"
    >
        <!--<span class="background">{{ '▓'.repeat(characterCount) }}</span>-->
        <fitted-content
            v-if="useFittedContent"
            :align="props.textAlign"
            :style="{
                width: `${characterWidth * characterCount}px`,
                whiteSpace: props.progressBar != null ? 'pre' : undefined
            }"
        >
            <template v-if="progressBarInfo != null">
                {{ progressBarInfo.formattedText }}
            </template>
            <template v-else>
                {{ props.textContent }}
            </template>
        </fitted-content>
        <span
            v-else
            style="white-space: pre; width: 100%"
            :style="{
                width: `${characterWidth * characterCount}px`
            }"
        >
            <template v-if="progressBarInfo != null">
                {{ progressBarInfo.formattedText }}
            </template>
            <template v-else>
                {{ visibleText }}
            </template>
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import FittedContent from 'components/FittedContent.vue';
import { shortenLargeNumber } from 'client-shared/helpers/StringHelper';
import { TextScrollEventBusInjectionKey } from '../helpers/TextScrollEventBus';

const textScrollEventBus = inject(TextScrollEventBusInjectionKey)!;

const props = withDefaults(defineProps<{
    fontSize: number
    textContent?: string | null
    align?: 'center' | 'left' | 'right'
    textAlign?: 'center' | 'left' | 'right',
    progressBar?: { start: number, end: number, current: number, showStartEnd?: boolean }
}>(), {
    align: 'center',
    textAlign: 'center'
});

const emit = defineEmits<{
    'scrollStarted': [],
    'scrollEndReached': []
}>();

const wrapper = ref<HTMLDivElement>();
const wrapperWidth = ref(1);
const wrapperResizeObserver = new ResizeObserver(entries => {
    wrapperWidth.value = entries[0].contentRect.width;
});
onMounted(() => {
    wrapperResizeObserver.observe(wrapper.value!);
});
onUnmounted(() => {
    wrapperResizeObserver.disconnect();
});

const characterHeight = computed(() => Math.round(props.fontSize * 1.25));
const characterWidth = computed(() => props.fontSize * 0.35);
const characterCount = computed(() => Math.floor(wrapperWidth.value / characterWidth.value));
const justifyContent = computed(() => {
    switch (props.align) {
        case 'center':
            return 'center';
        case 'left':
            return 'flex-start';
        case 'right':
            return 'flex-end';
    }
});

const useFittedContent = computed(() => props.textContent != null && props.textContent.length - characterCount.value < 0);
let textScrollUnpauseTimeout: number | undefined = undefined;
let currentTextPosition = 0;
let formattedText: string = '';
const visibleText = ref('');
const textEndPauseDuration = 10000;
const scrollText = () => {
    if (formattedText.length - currentTextPosition > characterCount.value) {
        currentTextPosition++;
        visibleText.value = formattedText.slice(currentTextPosition, characterCount.value + currentTextPosition);
    } else {
        currentTextPosition++;
        const firstHalf = formattedText.slice(currentTextPosition, characterCount.value + currentTextPosition);
        visibleText.value = firstHalf + formattedText.slice(0, characterCount.value - firstHalf.length);
        if (firstHalf.length === 0) {
            currentTextPosition = 0;
            textScrollEventBus.off('scroll', scrollText);
            clearTimeout(textScrollUnpauseTimeout);
            textScrollUnpauseTimeout = window.setTimeout(() => textScrollEventBus.on('scroll', scrollText), textEndPauseDuration);
            emit('scrollEndReached');
            return;
        }
    }
};
watch(() => [props.textContent, characterCount.value] as [string | undefined | null, number], ([newText, newCharacterCount]) => {
    currentTextPosition = 0;
    textScrollEventBus.off('scroll', scrollText);
    clearTimeout(textScrollUnpauseTimeout);

    if (newText == null || useFittedContent.value) {
        visibleText.value = '';
        textScrollEventBus.off('scroll', scrollText);
        return;
    }

    visibleText.value = newText.slice(0, newCharacterCount);

    if (newText.length > newCharacterCount) {
        formattedText = newText.trim() + ' --- ';
        textScrollUnpauseTimeout = window.setTimeout(() => textScrollEventBus.on('scroll', scrollText), textEndPauseDuration);
        emit('scrollStarted');
    }
});

onUnmounted(() => {
    window.clearTimeout(textScrollUnpauseTimeout);
    textScrollEventBus.off('scroll', scrollText);
});

function getCharacterForRemainingPixels(pixels: number) {
    switch (pixels) {
        case 1:
            return '▏';
        case 2:
            return '▎';
        case 3:
            return '▍';
        case 4:
            return '▌';
        default:
            return '';
    }
}

const progressBarInfo = computed(() => {
    if (props.progressBar == null) return null;

    const current = Math.floor(props.progressBar.current);
    const end = Math.floor(props.progressBar.end);
    const start = Math.floor(props.progressBar.start);
    const formattedStart = shortenLargeNumber(start);
    const formattedEnd = shortenLargeNumber(end);
    const percentage = Math.min(1, (current - start) / (end - start));
    const fullPercentage = current / end;
    const formattedFullPercentage = `${Math.round(fullPercentage * 100)}%`;
    const characterPixelCount = 5;
    if (props.progressBar.showStartEnd) {
        const progressBarPixelCount = Math.max(
            6 + formattedStart.length + formattedEnd.length,
            characterCount.value - formattedStart.length - formattedEnd.length) * characterPixelCount;
        const litPixelCount = Math.max(1, Math.floor(percentage * progressBarPixelCount));
        const fullyLitCharacterCount = Math.floor(litPixelCount / characterPixelCount);
        let unlitCharacterCount = Math.max(0, Math.ceil((1 - percentage) * progressBarPixelCount / characterPixelCount));
        const remainingLitPixelCount = litPixelCount % characterPixelCount;
        if (remainingLitPixelCount !== 0) {
            unlitCharacterCount--;
        }
        const formattedText = `${formattedStart}${'▓'.repeat(fullyLitCharacterCount)}${getCharacterForRemainingPixels(remainingLitPixelCount)}${' '.repeat(unlitCharacterCount)}${formattedEnd}`;
        const percentageStartPosition = Math.floor(formattedText.length / 2) - Math.floor(formattedFullPercentage.length / 2);

        // Centers the percentage on the resulting string
        return {
            formattedText: formattedText.substring(0, percentageStartPosition) + formattedFullPercentage + formattedText.substring(percentageStartPosition + formattedFullPercentage.length)
        };
    } else {
        const progressBarPixelCount = Math.max(6, characterCount.value) * characterPixelCount;
        let litPixelCount = Math.max(1, Math.floor(percentage * progressBarPixelCount));
        let fullyLitCharacterCount = Math.floor(litPixelCount / characterPixelCount);
        let unlitCharacterCount = Math.max(0, Math.ceil((1 - percentage) * progressBarPixelCount) / characterPixelCount);
        let remainingLitPixelCount = litPixelCount % characterPixelCount;
        if (unlitCharacterCount <= formattedFullPercentage.length) {
            fullyLitCharacterCount -= (formattedFullPercentage.length - unlitCharacterCount);
            if (remainingLitPixelCount !== 0) {
                remainingLitPixelCount = 0;
                fullyLitCharacterCount++;
            }
            unlitCharacterCount = 0;
        } else {
            unlitCharacterCount -= formattedFullPercentage.length;
        }

        return {
            formattedText: `${'▓'.repeat(fullyLitCharacterCount)}${getCharacterForRemainingPixels(remainingLitPixelCount)}${formattedFullPercentage}${' '.repeat(unlitCharacterCount)}`
        };
    }
});
</script>

<style scoped lang="scss">
@use '../styles/colors';

.vfd-pixel-text {
    font-family: 'Tahoma';
    color: colors.$vfd-teal;
    display: flex;
    text-rendering: geometricPrecision;
    position: relative;

    > span {
        position: absolute;
    }
}

.background {
    color: colors.$vfd-teal-unlit;
    position: absolute;
}
</style>

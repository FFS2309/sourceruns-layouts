<template>
    <div
        class="separator"
        :class="props.direction"
    >
        <div class="highlight" />
        <div class="core" />
        <div class="shadow" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    direction: 'horizontal' | 'vertical'
}>();
</script>

<style scoped lang="scss">
@use '../styles/colors';

$separator-color: colors.$hl-background-green;
$separator-color-highlight: colors.$hl-highlight;
$separator-color-shadow: colors.$hl-shadow;

.separator {
    background-color: $separator-color;
    display: grid;

    &.vertical {
        min-width: 14px;
        grid-template-columns: 2px 1fr 2px;
    }

    &.horizontal {
        min-height: 14px;
        grid-template-rows: 2px 1fr 2px;
    }

    > .highlight {
        background-color: $separator-color-highlight;
    }

    > .core {
        background-color: $separator-color;
    }

    > .shadow {
        background-color: $separator-color-shadow;
    }
}
</style>

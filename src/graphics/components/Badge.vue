<template>
    <span class="badge">
        <slot />
    </span>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
@use '../styles/colors';

.badge {
    background-color: colors.$hl-hud-bg-transparent;
    color: colors.$hl-hud-text-color;
    padding: 1px 4px;
    font-size: 0.7em;
    display: inline-block;
    font-family: 'Tahoma', sans-serif;
    font-weight: 500;
}
</style>

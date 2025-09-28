<template>
	<div>Hello {{ world }}</div>
</template>

<script setup>
import { ref } from 'vue';

const world = ref('World');
</script>

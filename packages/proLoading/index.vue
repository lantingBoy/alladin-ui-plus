<template>
	<loadingComp
		v-model:active="props.loading"
		loader="spinner"
		:is-full-page="props.fullpage"
		color="rgb(30,143,160)"
		background="rgb(75,75,75)"
		:width="50"
		:height="50"
	/>
</template>

<script setup lang="ts" name="ProLoading">
import { computed } from 'vue';
import loadingComp from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

interface LoadingProps {
	loading: boolean;
	fullpage: boolean;
}
const data = withDefaults(defineProps<LoadingProps>(), {
	loading: false,
	fullpage: true
});

const props = computed(() => data);
</script>


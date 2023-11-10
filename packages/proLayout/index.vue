<template>
	<div class="s_page_layout">
		<Loading :loading="props.loading" :fullpage="props.fullPage"></Loading>
		<slot></slot>
	</div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import Loading from '../proLoading/index.vue';
const data = defineProps<{ loading?: boolean; fullPage?: boolean }>();
const props = computed(() => data);
</script>
<script lang="ts">
export default {
	name: 'PageLayout'
};
</script>

<style lang="scss" >
.s_page_layout {
	display: flex;
	flex: 1;
	flex-direction: column;
	width: 100%;
	height: 100%;
}
</style>

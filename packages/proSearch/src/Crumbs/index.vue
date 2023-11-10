<template>
	<div class="s_crumbs">
		<el-breadcrumb separator="/">
			<template v-for="(crumb, i) in crumbs" :key="i">
				<el-breadcrumb-item :to="crumbs.length === 1 || i === crumbs.length - 1 ? '' : { path: crumb.pathname }">
					<template #default>
						<div
							style="cursor: pointer"
							class="crumb_title"
							:class="{
								disabled: crumbs.length === 1 || i === crumbs.length - 1,
								hoverColor: crumbs.length > 1 && i !== crumbs.length - 1
							}"
						>
							{{ crumb.title }}
						</div>
					</template>
				</el-breadcrumb-item>
			</template>
		</el-breadcrumb>
	</div>
</template>
<script setup lang="ts">
import { watch, ref } from 'vue';
const props = defineProps<{ title?: string }>();

type RouteInfo = {
	path: string;
	title: string | undefined;
	pathname: string;
};
const crumbs = ref<RouteInfo[]>([]);
function getCrumbs() {
	crumbs.value = JSON.parse((sessionStorage.getItem('CRUMB_LIST') as any) || '[]');
}
getCrumbs();
function setCrumbs() {
	sessionStorage.setItem('CRUMB_LIST', JSON.stringify(crumbs.value));
}

watch(
	() => window.location.href,
	() => {
		if (
			(crumbs.value && !window.location.href.startsWith(crumbs.value[0]?.path)) ||
			window.location.href === crumbs.value[0].path ||
			// 同一个路由地址，携带参数的情况
			(crumbs.value &&
				window.location.href.startsWith(crumbs.value[0]?.path) &&
				window.location.pathname === crumbs.value[0]?.pathname)
		) {
			crumbs.value = [];
		}
		crumbs.value.forEach(item => {
			if (item.path.startsWith(window.location.href)) {
				return;
			}
		});

		crumbs.value.push({ title: props.title, path: window.location.href, pathname: window.location.pathname });
		setCrumbs();
	},
	{ deep: true, immediate: true }
);
const existIndex = crumbs.value.findIndex(
	crumb => crumb.path === window.location.href || crumb.title === window.location.pathname
);

if (existIndex > -1 && existIndex !== 0) {
	crumbs.value.splice(existIndex + 1);
}
</script>
<script lang="ts">
export default {
	name: 'crumbs'
};
</script>
<style lang="scss" scoped>
.s_crumbs {
	.hoverColor {
		&:hover {
			font-size: 16px !important;
			color: #008794;
		}
	}
	.el-breadcrumb {
		.el-breadcrumb__separator {
			margin: 0 2px;
		}

		display: flex;
		align-items: center;
		font-size: 16px;
	}

	display: flex;
	.disabled {
		font-size: 16px !important;
		color: #8b8f8f !important;
	}
	.crumb_tittle {
		margin: 0 2px;
		font-size: 16px !important;
		color: #333333;
	}
}
</style>

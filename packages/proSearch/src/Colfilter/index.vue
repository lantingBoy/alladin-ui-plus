<script lang="ts" setup>
import { computed } from 'vue';
import type Node from 'element-plus/es/components/tree/src/model/node';
import type { AllowDropType } from 'element-plus/es/components/tree/src/tree.type';

import { ColFilterConfig } from '../types';

const props = withDefaults(
	defineProps<{
		config?: ColFilterConfig;
	}>(),
	{}
);

const emits = defineEmits<{
	(e: 'confirm'): void;
}>();

const finalConfig = computed(() => props.config || {});

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType):any => {
	if (!draggingNode || !draggingNode.id || !dropNode || !draggingNode.nextSibling || !dropNode.id || !draggingNode.nextSibling.id)
		return;
	if (draggingNode.data.disabled || dropNode.data.disabled) return;
	if (type === 'inner') return;
	if (draggingNode.nextSibling === undefined) {
		return type === 'prev';
	} else if (dropNode.nextSibling === undefined) {
		return type === 'next';
	} else if (draggingNode.nextSibling.id !== dropNode.id) {
		return type === 'prev';
	} else {
		return type === 'next';
	}

	return true;
};
const allowDrag = ():boolean => {
	return true;
};

const confirm = () => {
	emits('confirm');
};
</script>

<template>
	<div class="viewSwitcher tableFilter">
		<el-popover placement="bottom" title="列设置(可拖拽)" :width="260" trigger="click">
			<template #reference>
				<div class="hoverScale tableFilter-icon">
					<i class="iconfont icon-shaixuan1" title="表格筛选"></i>
				</div>
			</template>
			<div class="tableFilter-list">
				<el-tree
					class="tableFilter-list-tree"
					:allow-drop="allowDrop"
					:allow-drag="allowDrag"
					:data="finalConfig.columns"
					draggable
					default-expand-all
					node-key="prop"
				>
					<template #default="{ node, data }">
						<div class="list-tree-default">
							<el-checkbox style="margin-right: 5px" :disabled="data.disabled" v-model="data._checked"></el-checkbox>
							<span>{{ node.label }}</span>
						</div>
					</template>
				</el-tree>
			</div>
			<div class="tableFilter-btn">
				<el-button type="primary" @click="confirm">确定</el-button>
			</div>
			<!-- <el-table :data="finalConfig.columns" height="360px">
				<el-table-column width="40">
					<template #default="scope">
						<el-checkbox
							@change="finalConfig && finalConfig.tableFilterColChange && finalConfig.tableFilterColChange(finalConfig.columns)"
							v-model="scope.row._checked"
						/>
					</template>
				</el-table-column>
				<el-table-column prop="label" />
			</el-table> -->
		</el-popover>
	</div>
</template>

<style lang="scss" scoped>
.tableFilter-list {
	height: 360px;
	overflow-y: auto;

	// :deep(.el-tree.is-dragging .el-tree-node__content) {
	// 	cursor: context-menu;
	// }
	.tableFilter-list-tree {
		:deep(.el-tree-node__expand-icon) {
			display: none;
		}
		.list-tree-default {
			display: flex;
			align-items: center;
			padding: 0 5px;
		}
	}
}
.tableFilter-btn {
	display: flex;
	justify-content: center;
	padding-top: 10px;
	margin-top: 10px;
	border-top: 1px solid #eeeeee;
	:deep(.el-button) {
		width: 100%;
		height: 28px;
	}
}
</style>
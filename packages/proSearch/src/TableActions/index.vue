<template>
	<div class="btnGroup">
		<slot name="leftButton"></slot>
		<el-button text bg color="#E7F2F7" v-show="tableLength">
			<div style="font-size: 14px; color: #666666; background: #e7f2f7">
				<span style="margin-right: 5px">{{ tableLength }}条</span>
				<span>已选取</span>
			</div>
		</el-button>
	</div>
	<div class="table_actions">
		<div class="config-header" v-if="tableLength || showAll">
			<div class="tools-bar">
				
				<el-dropdown trigger="click" style="margin-left: 20px" v-if="showActions.actions">
					<span class="dropdown-link">
						<i class="hdzkIcon icon-dongzuo" style="vertical-align: middle"></i>
						动作</span
					>
					<template #dropdown>
						<el-dropdown-menu>
							<slot name="actions"></slot>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
				<slot name="fullActions"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"  name="TableActions">
import { ref } from 'vue';
import { OptionsIsShow } from '../types';

const props = defineProps<{ printAreaId?: string; tableLength: number; showActions: OptionsIsShow; showAll: boolean }>();
//打印

</script>

<style lang="scss" scoped>
.table_actions {
	box-sizing: border-box;
	display: flex;
	justify-content: flex-end;
	width: 38%;
	padding-right: 100px;
	.config-header {
		:deep(.el-space__item) {
			width: 100%;
		}

		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 32px;
		background: #ffffff;
		.tools-bar {
			display: flex;
			flex: 1;
			align-items: center;
			justify-content: flex-end;

			// padding-right: 30px;
			color: #666666 !important;
			:deep(.el-button--text) {
				color: #666666;
			}
			.dropdown-link {
				color: #666666 !important;
				cursor: pointer;
			}
		}
	}
	:deep(.el-space__item) {
		width: 100%;
		margin-top: 4px !important;
		margin-bottom: 4px !important;
	}
	:deep(.el-dropdown) {
		display: flex;
		align-items: center;
	}
	:deep(.el-button) {
		&:hover {
			background-color: #026d6b;
		}
	}
}
</style>
../../types../types
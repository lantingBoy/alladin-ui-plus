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
				<el-button link v-print="printInfo" v-if="printAreaId">
					<template #icon>
						<i class="hdzkIcon icon-dayin"></i>
					</template>
					打印
				</el-button>
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
import print from 'vue3-print-nb';

const vPrint = print;
const props = defineProps<{ printAreaId?: string; tableLength: number; showActions: OptionsIsShow; showAll: boolean }>();
//打印
const printInfo = ref({
	id: props.printAreaId, //这里的id就是上面我们的打印区域id，实现指哪打哪
	popTitle: '', // 打印配置页上方的标题
	extraHead: '', // 最上方的头部文字，附加在head标签上的额外标签，使用逗号分割
	preview: false, // 是否启动预览模式，默认是false

	previewPrintBtnLabel: '预览结束，开始打印', // 打印预览的标题下方的按钮文本，点击可进入打印
	zIndex: 20003, // 预览窗口的z-index，默认是20002，最好比默认值更高
	previewBeforeOpenCallback() {
		console.log('正在加载预览窗口！');
	}, // 预览窗口打开之前的callback
	previewOpenCallback() {
		console.log('已经加载完预览窗口，预览打开了！');
	}, // 预览窗口打开时的callback
	beforeOpenCallback() {
		console.log('开始打印之前！');
	}, // 开始打印之前的callback
	openCallback() {
		console.log('执行打印了！');
	}, // 调用打印时的callback
	closeCallback() {
		console.log('关闭了打印工具！');
	}, // 关闭打印的callback(无法区分确认or取消)
	clickMounted() {
		console.log('点击v-print绑定的按钮了！');
	}
});
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
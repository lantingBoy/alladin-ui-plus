<template>
	<div class="search_input" v-if="searchCandidates.length">
		<div class="searchList" :class="{ showBorder: selectedQueryConditions?.length }">
			<el-space nowrap>
				<div class="searchItem" v-for="condition in selectedQueryConditions.slice(0, 2)" :key="condition.value">
					<div class="typeIcon">
						<i class="hdzkIcon" :class="condition.icon"></i>
					</div>
					<span class="itemText">{{ condition.label }}</span>
					<el-icon @click="deleteCondition(condition)">
						<Close />
					</el-icon>
				</div>
				<div class="searchItem" v-if="selectedQueryConditions.length > 2">
					<el-popover placement="bottom" width="auto" trigger="click">
						<template #reference>
							<div style="display: grid; grid-template-columns: 1fr 1fr; align-items: center; justify-content: center">
								<div class="typeIcon" style="display: flex; align-items: center; justify-content: center; height: 100%">
									<el-icon><Plus /></el-icon>
								</div>
								<span class="itemText" style="text-align: center">{{ selectedQueryConditions.length - 2 }}</span>
							</div>
						</template>
						<div class="search_candidate_hideItem" v-for="condition in selectedQueryConditions.slice(2)" :key="condition.value">
							<div class="typeIcon">
								<i class="hdzkIcon" :class="condition.icon"></i>
							</div>
							<div class="search_hide_item">
								<span class="itemText">{{ condition.label }}</span>
								<el-icon @click="deleteCondition(condition)">
									<Close />
								</el-icon>
							</div>
						</div>
					</el-popover>
				</div>
			</el-space>
		</div>
		<el-popover placement="bottom" :visible="showPopover" :width="popoverWidth">
			<template #reference>
				<div>
					<el-input
						ref="inputEl"
						class="searchInp"
						:class="{ notShowShadow: searchCandidates?.length }"
						v-model.trim="searchVal"
						clearable
						placeholder="搜索..."
						:suffix-icon="Search"
					/>
				</div>
			</template>
			<div v-if="searchCandidates">
				<div v-for="(item, i) in searchCandidates" :key="i">
					<div class="search-results" @click="selectCondition(item)">
						<span> {{ item.label }}</span>
						<span class="searchVal">{{ searchVal }}</span>
					</div>
				</div>
			</div>
		</el-popover>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { Search } from '@element-plus/icons-vue';
import type { SearchCandidateProperties } from '../types';

defineProps<{ searchCandidates: SearchCandidateProperties[] }>();
const showPopover = ref(false);
const El = document.querySelector('#app');
const searchVal = ref('');
const inputEl = ref<any>();
const popoverWidth = ref(0);
const selectedQueryConditions = ref<SearchCandidateProperties[]>([]);
watch(searchVal, n => {
	showPopover.value = !!n;
	const inputWidth = inputEl.value?.ref?.clientWidth + 44;
	if (popoverWidth.value != inputWidth) {
		popoverWidth.value = inputWidth;
	}
});

function closePopover() {
	showPopover.value = false;
}
onMounted(() => {
	nextTick(() => {
		popoverWidth.value = inputEl.value?.ref?.clientWidth + 44;
	});
	El?.addEventListener('click', closePopover);
});

onUnmounted(() => {
	El?.removeEventListener('click', closePopover);
});

const emits = defineEmits(['change-condition', 'invert-selection', 'reset-date', 'change-range']);

// 添加查询条件
function selectCondition(condition: SearchCandidateProperties):void {
	const index = selectedQueryConditions.value.findIndex(item => item.query === condition.value);
	if (index > -1) {
		selectedQueryConditions.value.splice(index, 1);
	}

	selectedQueryConditions.value.push({
		icon: 'icon-search',
		query: condition.value,
		label: condition.label + searchVal.value,
		value: searchVal.value
	});
	searchVal.value = '';
	showPopover.value = false;

	emits('change-condition');
}

// 添加条件
function addCondition(condition: SearchCandidateProperties):void {
	if (condition.type === 'date') {
		selectedQueryConditions.value = selectedQueryConditions.value.filter(item => item.type !== 'date');
		selectedQueryConditions.value.push(condition);
		return;
	} else if (condition.type === 'dateList') {
		selectedQueryConditions.value.push(condition);
		return;
	}
	selectedQueryConditions.value.forEach((item, i) => {
		if (item.query === condition.query) {
			selectedQueryConditions.value.splice(i, 1);
		}
	});
	selectedQueryConditions.value.push(condition);
	emits('change-condition');
}
// 导出方法供其他组件使用
function exportAddCondition(condition: SearchCandidateProperties):void {
	if (condition.type === 'date') {
		selectedQueryConditions.value = selectedQueryConditions.value.filter(item => item.type !== 'date');
		selectedQueryConditions.value.push(condition);
		return;
	}
	const index = selectedQueryConditions.value.findIndex(item => item.label === condition.label);
	if (index > -1) {
		selectedQueryConditions.value.splice(index, 1);
	} else {
		selectedQueryConditions.value.forEach((item, i) => {
			if (item.query === condition.query) {
				selectedQueryConditions.value.splice(i, 1);
			}
		});
		selectedQueryConditions.value.push(condition);
	}
	emits('invert-selection', condition);
	emits('change-condition');
}
// 删除查询条件
// executeEmits 是否调用emits   true 不调用  false 调用
function deleteCondition(condition: SearchCandidateProperties, executeEmits?: boolean):void {
	if (condition.type === 'date') {
		selectedQueryConditions.value.splice(
			selectedQueryConditions.value.findIndex(item => item.type === 'date'),
			1
		);
		// emits("reset-date", "resetDate");
		emits('change-condition', true);
		return;
	}
	if (condition.type === 'range') {
		selectedQueryConditions.value.splice(
			selectedQueryConditions.value.findIndex(item => item.query === condition.query),
			1
		);
		// emits("reset-date", "resetDate");
		emits('change-range', condition.query);
		return;
	}
	const index = selectedQueryConditions.value.findIndex(item => item.label === condition.label);
	index >= 0 && selectedQueryConditions.value.splice(index, 1);
	if (executeEmits) return;
	emits('invert-selection', condition);
	emits('change-condition');
}
function resetFilterRules() :void{
	selectedQueryConditions.value = [];
	// emits("change-condition", selectedQueryConditions);
	emits('change-condition', true);
}
defineExpose({ addCondition, deleteCondition, exportAddCondition, resetFilterRules, selectedQueryConditions });
</script>
<script lang="ts">
export default {
	name: 'InputSearch'
};
</script>
<style lang="scss" scoped>
.search-results {
	display: flex;
	flex-wrap: nowrap;
	padding: 5px;
	overflow: hidden;
	font-weight: 500;
	color: #1e8fa0;
	cursor: pointer;
	.searchVal {
		color: #606266;
	}
	&:hover {
		background-color: #eaecef;
		border-radius: 5px;
	}
}
.search_candidate_hideItem {
	display: flex;
	align-items: center;
	width: 100%;
	height: 20px;
	margin: 10px 0;
	overflow: hidden;
	font-size: 14px;
	font-weight: 400;
	line-height: 20px;
	color: #8f8f8f;
	text-overflow: clip;
	white-space: nowrap;
	cursor: pointer;
	background: #f8f9fa;
	border: 1px solid #8f8f8f;
	.itemText {
		padding: 0 3px;
	}
	.search_hide_item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.typeIcon {
		padding: 0 2px;
		color: #ffffff;
		background: #1e8fa0;
		.hdzkIcon {
			font-size: 14px !important;
			color: #ffffff;
		}
	}
}
</style>
../../types../types
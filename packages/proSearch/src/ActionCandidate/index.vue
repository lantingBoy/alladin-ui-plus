<template>
	<div class="s_candidate" style="margin-right: 10px">
		<el-popover
			placement="bottom-start"
			:width="100"
			:popper-style="{ padding: '5px 0' }"
			trigger="click"
			:show-arrow="false"
			ref="parentPopRef"
			:disabled="candidateList.length === 0"
		>
			<template #reference>
				<div class="collect s_item" @click="defaultEmit">
					<i class="hdzkIcon" :class="icon"></i>
					<span>{{ props.title }}</span>
				</div>
			</template>
			<div
				v-for="(candidate, i) in transFormData(candidateList)"
				:key="candidate.label"
				class="s_itemList"
				:class="{
					tree_border: mode !== 'flat',
					flat_border: mode === 'flat' && candidate.genre !== calculateGenre(transFormData(candidateList), i)
				}"
			>
				<p
					v-if="
						mode === 'flat' && candidate.genre && (candidate.genre !== calculateGenre(transFormData(candidateList), i) || i === 0)
					"
					class="title"
				>
					{{ getCandidateTitle(candidate.genre) }}
				</p>
				<el-popover
					:popper-style="{ padding: '5px 0' }"
					trigger="click"
					placement="right-start"
					:disabled="!candidate?.children?.length"
					ref="subPopRef"
					:show-arrow="false"
				>
					<template #reference>
						<div :class="['menu', 'flx-align-center', mode === 'flat' && 'flat-menu']" @click.stop="selectFilter(candidate)">
							<div class="flx-align-center">
								<div class="selectText">
									<span :class="{ selected_text: candidate.selected }">
										{{ candidate.label }}{{ candidate?.children?.length ? `(${candidate?.children?.length})` : '' }}</span
									>

									<span v-if="candidate.selected">
										<el-icon class="selectIcon"><Select /></el-icon>
									</span>
								</div>
							</div>
							<el-icon v-if="candidate?.children?.length">
								<ArrowRight />
							</el-icon>
						</div>
					</template>

					<div class="menu flx-align-center" v-for="(sub, k) in candidate.children" :key="k" @click.stop="selectFilter(sub)">
						<span :class="{ selected_text: sub.selected }"> {{ sub.label }}</span>
						<span v-if="sub.selected">
							<el-icon class="selectIcon"><Select /></el-icon>
						</span>
					</div>
				</el-popover>
			</div>
		</el-popover>
	</div>
</template>

<script setup lang="ts" name="ActionCandidate">
import { DataStructure, SearchCandidateProperties } from '../types';
import { ref } from 'vue';

import { PopoverInstance } from 'element-plus';
const props = withDefaults(
	defineProps<{ candidateList?: SearchCandidateProperties[]; title?: string; icon?: string; mode?: DataStructure }>(),
	{
		candidateList: () => [],
		icon: 'icon-shaixuan',
		title: '筛选',
		mode: 'flat'
	}
);

const emits = defineEmits(['change-filter', 'remove-filter', 'default-emit', 'trigger-condition']);
const parentPopRef = ref<PopoverInstance | null>(null);
const subPopRef = ref<PopoverInstance | null>(null);
// 递归实现树形结构扁平化;
const transFormData = (source: SearchCandidateProperties[]): SearchCandidateProperties[] => {
	if (props.mode === 'flat') {
		let res: SearchCandidateProperties[] = [];
		source?.forEach(el => {
			if (el.genre && el.children) {
				el.children.forEach((element: SearchCandidateProperties) => {
					element.genre = el.genre;
				});
			}
			res.push(el);
			el.children && res.push(...transFormData(el.children));
		});
		return res.filter(item => !item.hasOwnProperty('children'));
	}
	return source;
};
function calculateGenre(source: any, index: number) {
	return index > 0 ? source[index - 1].genre : source[0].genre;
}

/** 获取筛选项对应label */
const getCandidateTitle = (genre: string) => {
	return props.candidateList?.find(item => item.genre === genre)?.label;
};

function defaultEmit():void {
	if (!props.candidateList?.length) {
		emits('default-emit');
	}
}
function selectFilter(sub: SearchCandidateProperties):void {
	if (sub.type === 'trigger') {
		emits('trigger-condition');
		parentPopRef.value?.hide();
		return;
	}
	if (sub.children?.length) {
		return;
	}
	if (parentPopRef.value) {
		parentPopRef.value?.hide();
	}
	if (sub.selected) {
		// sub.selected = false;

		// invertSelection(sub);
		emits('remove-filter', sub);
		return;
	}
	const parentCandidate = props.candidateList?.find(item => item.children?.includes(sub));
	if (parentCandidate?.children) {
		parentCandidate?.children.forEach((item: any) => (item.selected = false));
	}
	// props.candidateList.forEach(item => {
	// 	if (item.genre === sub.genre) {
	// 		item.selected = false;
	// 	}
	// });
	emits('change-filter', {
		icon: props.icon,
		query: sub.genre ?? parentCandidate?.genre,
		label: sub.label,
		value: sub.value,
		selected: false
	});
	if (subPopRef.value) {
		for (let valueKey in subPopRef.value) {
			subPopRef.value[valueKey as keyof typeof subPopRef.value].hide();
		}
	}
	sub.selected = true;
}
// 反选已移除查询条件
function invertSelection(condition: SearchCandidateProperties):void {
	props.candidateList?.forEach(item => {
		if (item.label === condition.label) {
			item.selected = !item.selected;
		} else {
			item.children?.forEach((child: SearchCandidateProperties) => {
				if (child.label === condition.label) {
					child.selected = !child.selected;
				} else {
					if (child.genre === (condition.genre ?? condition.query)) {
						child.selected = false;
					}
				}
			});
			// const existItem = item.children?.find(child => child.label === condition.label);
			// if (existItem) {
			// 	// existItem.selected = !existItem.selected;
			// }
		}
	});
}

// 反选所有查询条件
function resetAllRules():void {
	if (props.candidateList.length > 0) {
		props.candidateList.forEach(item => {
			if (item.hasOwnProperty('children')) {
				item.children?.forEach(el => (el.selected = false));
			} else {
				item.selected = false;
			}
		});
	}
}

const init = () => {
	// 初始化将所有children的selected置为false
	props.candidateList.forEach(item => {
		item.children?.forEach(el => (el.selected = false));
	});
};

init();

defineExpose({
	invertSelection,
	selectFilter,
	resetAllRules
});
</script>

<style lang="scss">
.s_itemList {
	position: relative;
	padding-top: 2px;
	cursor: pointer;
	.title {
		cursor: default;
		padding: 2px 5px;
		font-weight: 600;
	}
	.flat-menu {
		padding-left: 10px;
	}
}
.flx-align-center {
	justify-content: space-between;
	padding: 5px 0;
	cursor: pointer;
	&:hover {
		background: #e9ecef;
	}
}
.menu {
	padding: 2px 5px;
}
.flat_border {
	border-top: 1px solid #cccccc;
}
.selected_text,
.selectIcon {
	font-weight: 700;
	color: #089390;
}
.tree_border {
	border-bottom: 1px solid #cccccc;
	&:last-child {
		border-bottom: none;
	}
}
</style>
../../types../types
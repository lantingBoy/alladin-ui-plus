<template>
	<div class="s_page_search">
		<div class="s_page_search_con">
			<Crumbs :title="title" />
			<InputSearch
				@invert-selection="invertSelection"
				ref="inputSearch"
				@reset-date="changeDate"
				@change-range="changeRange"
				@change-condition="changeDate"
				:search-candidates="props.options"
			></InputSearch>
		</div>
		<div class="action">
			<TableActions
				:show-all="showAllActions"
				:show-actions="showActions"
				:print-area-id="printNodeId"
				:table-length="tableLength"
			>
				<template #actions>
					<slot name="actionGroup"></slot>
				</template>
				<template #fullActions>
					<slot name="actionGroups"></slot>
				</template>
				<template #leftButton>
					<slot name="buttonGroup"></slot>
				</template>
			</TableActions>

			<div class="searchOperation" v-show="showAllOperations">
				<el-space>
					<ActionCandidate
						ref="actionRef"
						@trigger-condition="defaultEmit('trigger')"
						v-if="config.filter"
						:mode="mode ? mode : filterMode"
						@remove-filter="removeFilter"
						@default-emit="defaultEmit('filter')"
						@change-filter="changeFilter"
						:candidate-list="filterList"
					></ActionCandidate>
					<ActionCandidate
						ref="groupingRef"
						title="分组"
						@trigger-condition="defaultEmit('trigger')"
						v-if="config.grouper"
						:mode="mode ? mode : groupingMode"
						icon="icon-fenzu"
						@remove-filter="removeFilter"
						@default-emit="defaultEmit('grouper')"
						@change-filter="changeFilter"
						:candidate-list="grouperList"
					></ActionCandidate>
					<ActionCandidate
						title="收藏"
						@trigger-condition="defaultEmit('trigger')"
						v-if="config.gather"
						icon="icon-shoucang"
						:candidate-list="gatherList"
						@default-emit="defaultEmit('gather')"
						ref="collectionRef"
						@remove-filter="removeFilter"
						@change-filter="changeFilter"
					></ActionCandidate>
					<ActionCandidate
						v-if="config.exporter"
						title="导出"
						v-loading="!!config.exporter && !!config.exporterLoading"
						:candidate-list="exporterList"
						@trigger-condition="defaultEmit('trigger')"
						icon="icon-daochu"
						@default-emit="defaultEmit('exporter')"
						ref="collectionRef"
						@remove-filter="removeFilter"
						@change-filter="changeFilter"
					></ActionCandidate>
					<ActionCandidate title="重置" v-if="config.resetter" icon="icon-chongzhi" @click="reset"></ActionCandidate>

					<DatePicker
						:period="config.picker.period"
						:search-title="config.picker.title"
						v-if="config.picker?.show"
						:date-format="config.picker.dateFormat ?? getDefaultDateFormat(config.picker.dateType)"
						:type="config.picker.dateType"
						ref="dateRef"
						@change-filter="changeFilter"
						@change-date="changeDate"
						icon="icon-daochu"
					></DatePicker>
					<div v-if="config.picker?.show" style="margin-left: 4px"></div>
					<!-- 多个日期选择器 -->
					<template v-if="dateList.length">
						<div class="custom_date_picker_container" style="position: relative" v-for="(item, i) in dateList" :key="i">
							<ActionCandidate
								:title="item.title || '时间'"
								@click="showPicker(i)"
								:icon="item.icon || 'icon-riqi'"
							></ActionCandidate>

							<el-date-picker
								v-model="item.data"
								@change="(val: any) => changeTime(item, val)"
								:ref="(el: any) => (dateRefs[i] = el)"
								:style="{ marginTop: item.dateType?.includes('range') ? '30px' : 0 }"
								style="position: absolute; top: 1%; left: 15%; z-index: 0; width: 0; opacity: 0"
								:value-format="item.dateType === 'week' ? 'YYYY-MM-DD' : item.dateFormat ?? getDefaultDateFormat(item.dateType)"
								:type="item.dateType || 'date'"
							/>
						</div>
					</template>
				</el-space>
			</div>
			<div class="viewSwitcher" v-if="showAllSwitchers">
				<el-space wrap>
					<div
						class="hoverScale"
						@click="changeList"
						v-if="showSwitcher.table"
						:class="{ backEBEBEB: currentIndex ? Number(currentIndex) === 0 : index === 0 }"
					>
						<i class="hdzkIcon icon-liebiaoshitu" title="列表视图"></i>
					</div>
					<div
						class="hoverScale"
						@click="changeCard"
						v-if="showSwitcher.card"
						:class="{ backEBEBEB: currentIndex ? Number(currentIndex) === 1 : index === 1 }"
					>
						<i class="hdzkIcon icon-kapianshitu cardView" title="卡片视图"></i>
					</div>
					<div class="hoverScale" @click="changeProgress" v-if="showSwitcher.progress" :class="{ backEBEBEB: index === 2 }">
						<i class="hdzkIcon icon-jindushitu" title="进度视图"></i>
					</div>
				</el-space>
			</div>
			<ColFilter v-if="colFilterConfig && colFilterConfig.show" :config="colFilterConfig" @confirm="colFilterConfirm" />
		</div>
	</div>
</template>

<script setup lang="ts" name="ProSearch">
import '../../assets/iconfont/iconfont.scss';
import { ref } from 'vue';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import Crumbs from './Crumbs/index.vue';
import InputSearch from './InputSearch/index.vue';
import TableActions from './TableActions/index.vue';
import ActionCandidate from './ActionCandidate/index.vue';
import DatePicker from './DatePicker/index.vue';
import ColFilter from './Colfilter/index.vue';
import {
	SearchCandidateProperties,
	DataStructure,
	OptionsIsShow,
	TriggerType,
	LayoutType,
	DateType,
	Config,
	DateList,
	ColFilterConfig,
	SearchCandidateType,
	SearchCandidateDateList
} from './types';

dayjs.extend(weekOfYear);
const dateRefs = ref<any[]>([]);
function showPicker(index: number) {
	if (dateRefs.value) {
		dateRefs.value![index].focus();
	}
}
const dateRangeList = ref<any[]>([]);
function changeTime(item: any, time: any):void {
	const isRange = item?.dateType.includes('range');
	const isWeek = item?.dateType === 'week';
	if (item) {
		if (!isRange) {
			inputSearch.value.exportAddCondition({
				icon: item?.icon || 'icon-riqi',
				query: item!.genre,
				label: `${item?.title || '日期'}: ${
					isWeek ? dayjs(item.data).format('YYYY') + '-' + dayjs(item.data).week() : item?.data
				}`,
				value: time
			});

			item.data = time;
		} else {
			const startTime = time[0].toString();
			const endTime = time[1].toString();
			dateRangeList.value = [
				...dateRangeList.value,
				{
					query: item?.genre[0],
					value: startTime
				},
				{
					query: item?.genre[1],
					value: endTime
				}
			];
			inputSearch.value.addCondition({
				icon: item?.icon || 'icon-riqi',
				query: item!.genre,
				label: `${item?.title || '日期'}: ${startTime} 至 ${endTime}`,
				value: time,
				type: 'range'
			});
		}
	}
}

type ObjProps = {
	[key: string]: any;
};

/**
 * @description 传参说明
 * @searchList 查询条件
 * @tableLength 已选择的列表个数
 * @isShow 展示类型
 * @mode 数据结构类型
 * @showSwitcher 是否显示切换
 */
type SearchProps = {
	showAllOperations?: boolean;
	showAllSwitchers?: boolean;
	showAllActions?: boolean;
	searchList?: any;
	dateType?: DateType;
	tableLength?: number;
	showInput?: boolean;
	isShow?: OptionsIsShow;
	mode?: DataStructure;
	filterMode?: DataStructure;
	groupingMode?: DataStructure;
	showSwitcher?: Pick<OptionsIsShow, 'card' | 'gant' | 'table' | 'progress'>;
	config?: Config;
	currentIndex?: number;
	showActions?: Pick<OptionsIsShow, 'print' | 'actions'>;
	options?: SearchCandidateProperties[];
	printNodeId?: string;
	filterList?: any[];
	grouperList?: any[];
	gatherList?: any[];
	exporterList?: any[];
	title?: string;
	dateFormat?: string;
	disabledDate?: Date;
	dateList?: DateList[];
	colFilterConfig?: ColFilterConfig;
};

const props:any = withDefaults(defineProps<SearchProps>(), {
	searchList: {},
	currentIndex: 0,
	tableLength: 0,
	showAllOperations: true,
	showAllSwitchers: true,
	showAllActions: false,
	mode: '',
	printNodeId: '',
	filterMode: 'flat',
	groupingMode: 'tree',
	dateList: () => [],

	showSwitcher: () => {
		return {
			table: true,
			card: true,
			progress: false
		};
	},
	config: () => {
		return {
			filter: true,
			grouper: true,
			gather: true,
			exporter: true,
			resetter: true,
			picker: {
				show: true,
				dateFormat: '',
				dateType: 'datetimerange',
				title: '查询时间',
				period: 0
			}
		};
	},
	showActions: () => {
		return {
			print: true,
			actions: true
		};
	},
	filterList: () => [],
	grouperList: () => [],
	gatherList: () => [],
	exporterList: () => [],
	options: () => []
});

type EmitProps = {
	(e: 'search', data: ObjProps): void;
	(e: 'change-gather'): void;
	(e: 'change-grouping'): void;
	(e: 'change-filter'): void;

	(e: 'switch', type: LayoutType): void;

	(e: 'trigger', param: TriggerType): void;
};
const emits = defineEmits<EmitProps>();
const index = ref(0);

const inputSearch = ref();
const actionRef = ref();
const groupingRef = ref();
const collectionRef = ref();
const dateRef = ref();
// 删除查询条件
// executeEmits 是否调用emits   true 不调用  false 调用
function removeFilter(condition: SearchCandidateProperties, executeEmits?: boolean):void {
	inputSearch.value.deleteCondition(condition, executeEmits);
}
// 添加查询条件
function changeFilter(condition: SearchCandidateProperties):void {
	inputSearch.value.addCondition(condition);
	// actionRef.value.selectFilter(condition);
}
// 其他组件添加查询条件
function addCondition(conditions: SearchCandidateType | SearchCandidateType[]):void {
	if (Array.isArray(conditions)) {
		conditions.forEach(condition => {
			addSingleCondition(condition);
		});
	} else {
		addSingleCondition(conditions);
	}

	// 添加查询条件后，更改入参触发搜索
	if (
		(Array.isArray(conditions) && conditions.find(condition => condition.type === 'dateList')) ||
		(!Array.isArray(conditions) && conditions.type === 'dateList')
	) {
		changeDate();
	}
}

/** 添加单条查询条件 */
const addSingleCondition = (condition: SearchCandidateType):void => {
	if (condition.type === 'date') {
		dateRef.value?.addDate(condition);
	} else if (condition.type === 'dateList') {
		// dateList 默认值按照类型 SearchCandidateDateList 处理
		const dateCondition = condition as SearchCandidateDateList;
		const findCondition = props.dateList.find(item =>
			Array.isArray(item.genre) && Array.isArray(condition.genre)
				? item.genre.join() === condition.genre.join()
				: item.genre === condition.genre
		);
		if (findCondition) {
			const isRange = Array.isArray(findCondition.genre);
			const index = props.dateList.findIndex(item =>
				Array.isArray(item.genre) && Array.isArray(condition.genre)
					? item.genre.join() === condition.genre.join()
					: item.genre === condition.genre
			);
			props.dateList[index].data = isRange ? [dateCondition.startTime, dateCondition.endTime as string] : dateCondition.startTime;
			const c = {
				icon: 'hdzkIcon icon-riqi',
				label: isRange
					? `${findCondition.title}: ${dateCondition.startTime} 至 ${dateCondition.endTime}`
					: `${findCondition.title}: ${dateCondition.startTime}`,
				type: 'dateList',
				query: findCondition.genre,
				value: isRange ? [dateCondition.startTime, dateCondition.endTime as string] : dateCondition.startTime
			};
			inputSearch.value?.addCondition(c);
		}
	} else {
		inputSearch.value?.exportAddCondition(condition);
	}
};

// 是否展示筛选列表项

// 切换不同视图 0: 列表视图 1: 卡片视图 2:流程视图
function changeList():void {
	index.value = 0;

	emits('switch', 'table');
}
function defaultEmit(param: TriggerType):void {
	emits('trigger', param);
}
function changeCard():void {
	index.value = 1;

	emits('switch', 'card');
}

function changeProgress():void {
	index.value = 2;

	emits('switch', 'gant');
}
function reset():void {
	inputSearch.value?.resetFilterRules();
	actionRef.value?.resetAllRules();
	groupingRef.value?.resetAllRules();
	dateRef.value?.resetValue();
	dateRangeList.value = [];
	props.dateList.forEach(item => (item.data = ''));
	defaultEmit('reset');
}
// 反选
function invertSelection(condition: SearchCandidateProperties):void {
	actionRef.value?.invertSelection(condition);
	groupingRef.value?.invertSelection(condition);
}

const changeRange = (query: string[]):void => {
	query.forEach(element => {
		dateRangeList.value = dateRangeList.value.filter(item => item.query !== element);
	});
	changeDate();
};
const colFilterConfirm = ():void => {
	let config = props.colFilterConfig;
	config && config.tableFilterColChange && config.tableFilterColChange(config.columns);
};
function changeDate(isDeleteDate?: boolean):void {
	if (inputSearch.value && inputSearch.value.selectedQueryConditions) {
		let list: any = [];
		const res = inputSearch.value.selectedQueryConditions.filter(
			(item: any) => item.type !== 'date' && item.type !== 'range' && item.type !== 'dateList'
		);

		// 处理dateList类型的入参
		const dateListTypeData = inputSearch.value.selectedQueryConditions.filter((itemL: any) => itemL.type === 'dateList');
		let dateListArgs: any[] = [];
		if (dateListTypeData.length) {
			dateListTypeData.forEach((item: any) => {
				if (Array.isArray(item.value)) {
					item.value.forEach((_item2: any, index: number) => {
						dateListArgs.push({
							query: item.query[index],
							value: item.value[index]
						});
					});
				} else {
					dateListArgs.push({
						query: item.query,
						value: item.value
					});
				}
			});
		}
		if ((dateRef.value && dateRef.value?.dateList.length > 0) || dateRangeList.value.length > 0) {
			let args: any = [];

			if (dateRef.value) {
				if (isDeleteDate) {
					args = [...dateRangeList.value];
					dateRef.value.dateList = [];
					dateRef.value.resetValue();
				} else {
					args = [...dateRef.value?.dateList, ...dateRangeList.value];
				}
			} else {
				args = [...dateRangeList.value];
			}

			list = [...res, ...args];
		} else {
			list = [...res];
		}
		// 将dateList类型的入参合并到list中
		list = [...dateListArgs, ...list];

		const search: ObjProps = {};
		list.forEach((i: any) => {
			if (i.query) {
				search[i.query] = i.value;
			}
		});
		emits('search', search);
	}
}
/** 获取显示在输入框中的默认格式 */
const getDefaultDateFormat = (type?: DateType): string => {
	/** 不同日期类型默认格式映射 */
	const formatMap: {
		[x in DateType]: string;
	} = {
		date: 'YYYY-MM-DD',
		dates: 'YYYY-MM-DD',
		daterange: 'YYYY-MM-DD',
		week: 'YYYY-MM-DD',
		month: 'YYYY-MM',
		monthrange: 'YYYY-MM',
		year: 'YYYY',
		datetime: 'YYYY-MM-DD HH:mm:ss',
		datetimerange: 'YYYY-MM-DD HH:mm:ss'
	};
	return type && formatMap[type] ? formatMap[type] : 'YYYY-MM-DD';
};

function resetRules():void {
	reset();
}
defineExpose({
	addCondition,
	removeFilter,
	resetRules
});
</script>

<style lang="scss">
@import './index.scss';
.custom_date_picker_container {
	.el-input__wrapper {
		width: 0;
		height: 0;
		padding: 0;
	}
	.el-input__prefix {
		height: 0;
	}
}
</style>
../types./types
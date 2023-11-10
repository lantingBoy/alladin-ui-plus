<template>
	<el-popover
		class="s_date_picker"
		:visible="parentVisible"
		placement="bottom"
		:width="width"
		:popper-style="{ padding: '0', visibility: 'hidden' }"
		trigger="click"
		:show-arrow="false"
	>
		<template #reference>
			<div class="collect s_item" @click="showPopover" v-click-outside="onClickOutside">
				<i class="hdzkIcon icon-riqi"></i>
				<span>{{ searchTitle }}</span>
			</div>
		</template>
		<el-date-picker
			@change="dateChange"
			v-model="dateValue"
			:show-arrow="false"
			:default-value="defaultDate"
			@calendar-change="panelChange"
			:visible="subVisible"
			:type="type"
			unlink-panels
			:offset="-50"
			:value-format="dateFormat"
			range-separator="至"
			start-placeholder="起始时间"
			end-placeholder="结束时间"
		>
		</el-date-picker>
	</el-popover>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ClickOutside as vClickOutside } from 'element-plus';
import { DateType } from '../types';
import dayjs from 'dayjs';
const parentVisible = ref(false);
const subVisible = ref(false);
const startTime = ref('');
const endTime = ref('');
const date = ref('');
const dateList = ref<any[]>([]);
const props = withDefaults(defineProps<{ type?: DateType; dateFormat?: string; searchTitle?: string; period?: number }>(), {
	type: 'daterange',
	dateFormat: 'YYYY-MM-DD',
	searchTitle: '日期'
});
const width:any = computed(() => (props.type === 'date' || props.type === 'datetime' ? null : 400));
const emits = defineEmits(['change-date', 'change-filter']);

const dateValue = ref<any[] | any>();
const onClickOutside = () => {
	parentVisible.value = false;

	subVisible.value = false;
};
const defaultDate = ref<any | any[]>();
function panelChange(date: any):void {
	if (date[0] && props.period && props.period > 0) {
		dateValue.value = ['', ''];
		defaultDate.value = [];
		defaultDate.value.push(date[0]);
		defaultDate.value.push(new Date(dayjs(date[0]).add(props.period, 'day').locale('zh-cn').format()));

		dateValue.value[0] = dayjs(date[0]).format(props.dateFormat);
		dateValue.value![1] = dayjs(date[0]).add(props.period, 'day').format(props.dateFormat);
		onClickOutside();
	}
}
let flag = watch(
	() => dateValue.value,
	() => {
		if (dateValue.value) {
			const isRange = props.type.includes('range');
			if (isRange) {
				startTime.value = dateValue.value![0].toString();
				endTime.value = dateValue.value![1].toString();
			} else {
				date.value = dateValue.value;
			}
			dateList.value = isRange
				? [
						{ query: 'startTime', value: startTime.value },
						{ query: 'endTime', value: endTime.value }
				  ]
				: [{ query: 'date', value: date.value }];
			emits('change-filter', {
				icon: 'hdzkIcon icon-riqi',
				label: isRange ? `${props.searchTitle}: ${startTime.value} 至 ${endTime.value}` : `${props.searchTitle}: ${date.value}`,
				type: 'date'
			});
			emits('change-date');
			onClickOutside();
		}
	}
);
function dateChange():void {
	flag();
	if (props.type === 'datetime') {
		date.value = dateValue.value;
		emits('change-date', { date: date.value });
		onClickOutside();
	}
}
function showPopover():void {
	subVisible.value = !subVisible.value;
	parentVisible.value = !parentVisible.value;
}
function addDate(date: any):void {
	if (date.endTime && props.type.includes('range')) {
		dateValue.value = ['', ''];
		dateValue.value[0] = date.startTime;
		dateValue.value![1] = date.endTime;
	} else {
		dateValue.value = date.startTime || date.date;
	}
}

/** 重置value */
function resetValue() {
	dateValue.value = undefined;
}

defineExpose({ dateList, addDate, resetValue });
</script>

<style lang="scss" scoped>
.s_date_picker {
	.menu {
		padding: 0 5px;
	}
	.flat_border {
		border-top: 1px solid #cccccc;
	}
	.selected_text,
	.selectIcon {
		font-weight: 700;
		color: #089390;
	}
	:deep(.el-date-editor) {
		visibility: hidden !important;
	}
	:deep(.el-input__wrapper) {
		visibility: hidden !important;
	}
	.timeDate {
		position: relative;
	}
	.date.el-date-editor {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
	}
	.el-divider {
		margin: 0;
	}
	.el-space {
		width: 100%;
	}
	:deep(.dateTime) {
		width: 170px;
		margin-top: 5px;
	}
}
</style>
../../types../types
export type DataStructure = 'tree' | 'flat' | '';
/**
 * 操作显示
 */

export type OptionsIsShow = {
	add?: boolean; // 创建按钮
	filter?: boolean; // 筛选
	grouper?: boolean; // 分组
	gather?: boolean; // 收藏
	table?: boolean; // 列表展示
	card?: boolean; // 卡片展示
	progress?: boolean; // 流程展示
	input?: boolean; // 输入框展示
	gant?: boolean; // 甘特图
	print?: boolean;
	all?: boolean;
	actions?: boolean;
	exporter?: boolean;
	dater?: boolean;
};

/**
 * @description 传参说明
 * @searchList 查询条件
 * @tableLength 已选择的列表个数
 * @isShow 展示类型
 * @mode 数据结构类型
 * @showSwitcher 是否显示切换
 */
export interface SearchProps {
	searchList?: any;
	tableLength?: number;
	isShow?: OptionsIsShow;
	showActions?: OptionsIsShow;
	mode?: DataStructure;
	showSwitcher?: OptionsIsShow;
	showOperations?: boolean;
	currentIndex?: number;
	searchCandidates?: SearchCandidateProperties[];
}

// 搜索候选项
export interface SearchCandidateProperties {
	label: string;
	query?: string | string[];
	selected?: boolean;
	type?: string;
	genre?: string;
	value?: string;
	title?: string;
	data?: string;
	icon?: string;
	children?: SearchCandidateProperties[];
}

export interface SearchCandidateDateList {
	type: 'dateList';
	genre: string | [string, string];
	startTime: string;
	endTime?: string;
}

export type SearchCandidateType = SearchCandidateProperties | SearchCandidateDateList;

export type Config = {
	filter?: boolean; // 筛选
	grouper?: boolean; // 分组
	gather?: boolean; // 收藏
	resetter?: boolean;
	exporterLoading?: boolean;
	picker?: {
		show?: boolean;
		dateFormat?: string;
		dateType?: DateType;
		title?: string;
		period?: number;
	};
	exporter?: boolean;
};
export type DateList = {
	// 标题
	title?: string;
	// 图标
	icon?: string;
	// 数据 填空字符串即可
	data: string | [string, string];
	// 查询参数 即请求载荷参数
	genre: string | [string, string];
	dateFormat?: string;
	dateType?: DateType;
};
export type LayoutType = 'card' | 'gant' | 'table';
export type TriggerType = 'filter' | 'grouper' | 'gather' | 'exporter' | 'trigger' | 'reset';
export type DateType = 'date' | 'datetime' | 'datetimerange' | 'daterange' | 'week' | 'month' | 'monthrange' | 'year' | 'dates';
export interface ColFilterConfig {
	show?: boolean;
	tableFilterColChange?: (val?: any) => void;
	columns?: any[];
}

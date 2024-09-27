<template>
  <!-- 表格主体 -->
  <div class="s_protable-wrap">
    <!-- 表格头部 操作按钮 -->
    <div class="table-header">
      <div class="header-button-lf">
        <slot
          name="tableHeader"
          :selected-list="selectedList"
          :selected-list-ids="selectedListIds"
          :is-selected="isSelected"
        />
      </div>
      <div v-if="toolButton" class="header-button-ri">
        <slot name="toolButton">
          <el-button
            v-if="showToolButton('refresh')"
            :icon="Refresh"
            circle
            @click="getTableList"
          />
          <el-button
            v-if="showToolButton('setting') && columns.length"
            :icon="Operation"
            circle
            @click="openColSetting"
          />
        </slot>
      </div>
    </div>
    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="processTableData"
      :border="border"
      :row-key="rowKey"
      @selection-change="selectionChange"
    >
      <!-- 默认插槽 -->
      <slot />
      <template v-for="item in tableColumns" :key="item">
        <!-- selection || radio || index || expand || sort -->
        <el-table-column
          v-if="item.type && columnTypes.includes(item.type)"
          v-bind="item"
          :align="item.align ?? 'center'"
          :reserve-selection="item.type == 'selection'"
        >
          <template #default="scope">
            <!-- expand -->
            <template v-if="item.type == 'expand'">
              <component :is="item.render" v-bind="scope" v-if="item.render" />
              <slot v-else :name="item.type" v-bind="scope" />
            </template>
            <!-- radio -->
            <el-radio
              v-if="item.type == 'radio'"
              v-model="radio"
              :label="scope.row[rowKey]"
            >
              <i></i>
            </el-radio>
            <!-- sort -->
            <el-tag v-if="item.type == 'sort'" class="move">
              <el-icon> <DCaret /></el-icon>
            </el-tag>
          </template>
        </el-table-column>
        <!-- other -->
        <TableColumn
          v-if="!item.type && item.prop && item.isShow"
          :column="item"
        >
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </TableColumn>
      </template>
      <!-- 插入表格最后一行之后的插槽 -->
      <template #append>
        <slot name="append" />
      </template>
      <!-- 无数据 -->
      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <img src="../../packages/assets/images/notData.png" alt="notData" />
            <div>暂无数据</div>
          </slot>
        </div>
      </template>
    </el-table>
    <!-- 分页组件 -->
    <slot name="pagination">
      <Pagination
        v-if="pagination"
        :pageable="{
          pageSize: pageable.size,
          pageNum: pageable.current,
          total: pageable.total,
        }"
        :handle-size-change="handleSizeChange"
        :handle-current-change="handleCurrentChange"
      />
    </slot>
  </div>
  <!-- 列设置 -->
  <ColSetting v-if="toolButton" ref="colRef" v-model:col-setting="colSetting" />
</template>

<script setup lang="ts" name="ProTable">
import { ref, watch, provide, onMounted, unref, computed, reactive } from 'vue'
import { Refresh, Operation } from '@element-plus/icons-vue'
import { ElTable } from 'element-plus'
import { BreakPoint } from '@/grid/interface'
import { ColumnProps, TypeProps } from '@/proTable/interface'
import { useTable } from './helper/useTable'
import { useSelection } from './helper/useSelection'
import Pagination from './components/Pagination.vue'
import ColSetting from './components/ColSetting.vue'
import TableColumn from './components/TableColumn.vue'
import Sortable from 'sortablejs'

export interface ProTableProps {
  columns: ColumnProps[] // 列配置项  ==> 必传
  data?: any[] // 静态 table data 数据，若存在则不会使用 requestApi 返回的 data ==> 非必传
  requestApi?: (params: any) => Promise<any> // 请求表格数据的 api ==> 非必传
  requestAuto?: boolean // 是否自动执行请求 api ==> 非必传（默认为true）
  requestError?: (params: any) => void // 表格 api 请求错误监听 ==> 非必传
  dataCallback?: (data: any) => any // 返回数据的回调函数，可以对数据进行处理 ==> 非必传
  title?: string // 表格标题 ==> 非必传
  pagination?: boolean // 是否需要分页组件 ==> 非必传（默认为true）
  initParam?: any // 初始化请求参数 ==> 非必传（默认为{}）
  border?: boolean // 是否带有纵向边框 ==> 非必传（默认为true）
  toolButton?: ('refresh' | 'setting' | 'search')[] | boolean // 是否显示表格功能按钮 ==> 非必传（默认为true）
  rowKey?: string // 行数据的 Key，用来优化 Table 的渲染，当表格数据多选时，所指定的 id ==> 非必传（默认为 id）
  searchCol?: number | Record<BreakPoint, number> // 表格搜索项 每列占比配置 ==> 非必传 { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }
}

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  requestAuto: true,
  pagination: true,
  initParam: {},
  border: false,
  toolButton: true,
  rowKey: 'id',
  searchCol: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
})

// table 实例
const tableRef = ref<InstanceType<typeof ElTable>>()

// column 列类型
const columnTypes: TypeProps[] = [
  'selection',
  'radio',
  'index',
  'expand',
  'sort',
]

// 控制 ToolButton 显示
const showToolButton = (key: 'refresh' | 'setting' | 'search') => {
  return Array.isArray(props.toolButton)
    ? props.toolButton.includes(key)
    : props.toolButton
}

// 单选值
const radio = ref('')

// 表格多选 Hooks
const { selectionChange, selectedList, selectedListIds, isSelected } =
  useSelection(props.rowKey)

// 表格操作 Hooks
const {
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  handleSizeChange,
  handleCurrentChange,
} = useTable(
  props.requestApi,
  props.initParam,
  props.pagination,
  props.dataCallback,
  props.requestError
)

// 清空选中数据列表
const clearSelection = () => tableRef.value!.clearSelection()

// 初始化表格数据 && 拖拽排序
onMounted(() => {
  dragSort()
  props.requestAuto && getTableList()
  props.data && (pageable.value.total = props.data.length)
})

// 处理表格数据
const processTableData = computed(() => {
  if (!props.data) return tableData.value
  if (!props.pagination) return props.data
  return props.data.slice(
    (pageable.value.current - 1) * pageable.value.size,
    pageable.value.size * pageable.value.current
  )
})

// 监听页面 initParam 改化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true })

// 接收 columns 并设置为响应式
const tableColumns = reactive<ColumnProps[]>(props.columns)



// 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
const enumMap = ref(new Map<string, { [key: string]: any }[]>())
const setEnumMap = async ({ prop, enum: enumValue }: ColumnProps) => {
  if (!enumValue) return

  // 如果当前 enumMap 存在相同的值 return
  if (
    enumMap.value.has(prop!) &&
    (typeof enumValue === 'function' || enumMap.value.get(prop!) === enumValue)
  )
    return

  // 当前 enum 为静态数据，则直接存储到 enumMap
  if (typeof enumValue !== 'function')
    return enumMap.value.set(prop!, unref(enumValue!))

  // 为了防止接口执行慢，而存储慢，导致重复请求，所以预先存储为[]，接口返回后再二次存储
  enumMap.value.set(prop!, [])

  // 当前 enum 为后台数据需要请求数据，则调用该请求接口，并存储到 enumMap
  const { data } = await enumValue()
  enumMap.value.set(prop!, data)
}

// 注入 enumMap
provide('enumMap', enumMap)

// 扁平化 columns 的方法
const flatColumnsFunc = (
  columns: ColumnProps[],
  flatArr: ColumnProps[] = []
) => {
  columns.forEach(async (col) => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children))
    flatArr.push(col)

    // column 添加默认 isShow && isFilterEnum 属性值
    col.isShow = col.isShow ?? true
    col.isFilterEnum = col.isFilterEnum ?? true

    // 设置 enumMap
    await setEnumMap(col)
  })
  return flatArr.filter((item) => !item._children?.length)
}




// 列设置 ==> 需要过滤掉不需要设置的列
const colRef = ref()
const colSetting = tableColumns!.filter((item) => {
  const { type, prop, isShow } = item
  return !columnTypes.includes(type!) && prop !== 'operation' && isShow
})
const openColSetting = () => colRef.value.openColSetting()

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'dargSort', data: { newIndex?: number; oldIndex?: number }): void
}>()



// 拖拽排序
const dragSort = () => {
  const tbody = document.querySelector(
    '.el-table__body-wrapper tbody'
  ) as HTMLElement
  Sortable.create(tbody, {
    handle: '.move',
    animation: 300,
    onEnd({ newIndex, oldIndex }) {
      const [removedItem] = processTableData.value.splice(oldIndex!, 1)
      processTableData.value.splice(newIndex!, 0, removedItem)
      emit('dargSort', { newIndex, oldIndex })
    },
  })
}

// 暴露给父组件的参数和方法 (外部需要什么，都可以从这里暴露出去)
defineExpose({
  element: tableRef,
  tableData: processTableData,
  radio,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  handleSizeChange,
  handleCurrentChange,
  clearSelection,
  enumMap,
  isSelected,
  selectedList,
  selectedListIds,
})
</script>

<style lang="scss" scoped>




.el-table--small {
	.el-table__header th {
		height: 40px;
		font-size: 14px;
	}
	.el-table__row {
		height: 40px;
		font-size: 13px;
	}
}
.el-table--large {
	.el-table__header th {
		height: 50px;
		font-size: 16px;
	}
	.el-table__row {
		height: 50px;
		font-size: 15px;
	}
}
.s_protable-wrap {
	position: relative;
	box-sizing: border-box;
	display: flex;
	flex: 1;
	flex-direction: column;
	width: 100%;
	height: 100%;
	padding-top: 0;
	overflow-x: hidden;
	background-color: var(--el-fill-color-blank);
	:deep(.el-scrollbar__view) {
		height: 100%;
	}
	:deep(.el-table__header) {
		.cell {
			font-family: AliPuHuiBold;
			font-size: 14px;
			color: #475059;
		}
	}
	:deep(.el-button) {
		font-size: 13px;
		letter-spacing: 0.5px;
	}
	:deep(.el-table__empty-text) {
		line-height: 30px;
	}

	// table-search 表格搜索样式
  .table-search {
    padding: 18px 18px 0;
    margin-bottom: 10px;
    .el-form {
      .el-form-item__content > * {
        width: 100%;
      }

      // 去除时间选择器上下 padding
      .el-range-editor.el-input__wrapper {
        padding: 0 10px;
      }
    }
    .operation {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-bottom: 18px;
    }
  }


	// 表格 header 样式
	.table-header {
		.header-button-lf {
			float: left;
		}
		.header-button-ri {
			float: right;
		}
		.el-button {
			margin-bottom: 15px;
		}
	}

	// el-table 表格样式
	:deep(.el-table__inner-wrapper) .el-table__body-wrapper .el-scrollbar .el-scrollbar__bar.is-horizontal {
		height: 10px;
	}
	.el-table__inner-wrapper::before {
		background: none;
	}
	.el-table {
		flex: 1;
		font-size: 12px;
		.el-table__header th {
			height: 45px;
			font-size: 14px;

			// font-weight: bold;
			color: #333333 !important;
		}
		.el-table__row {
			height: 36px;
			font-size: 13px;
		}

		// 小于1200px时，表格字体变小
		@media screen and (max-width: 1200px) {
			.el-table__row {
				font-size: 12px;
			}
		}

		// table 中 image 图片样式
		.table-image {
			width: 50px;
			height: 50px;
			border-radius: 50%;
		}
	}

	:deep(.el-table__row .el-table__cell) {
		// background-color: rgba(0, 0, 0, 0.01);
		// background-color: #f7f8fa;
		color: #3d5266;
		border: 1px solid transparent;
		padding: 7.5px 0;
	}
	:deep(.el-table__row .el-table__cell:hover) {
		border: 1px solid #4e80f5;
		border-radius: 4px;
	}
	:deep(.el-table .el-table__row:first-child) {
		box-shadow: inset 0px 5px 10px -4px rgba(0, 0, 0, 0.1);
	}
  :deep(.el-table__body .el-table__row:nth-child(even) .el-table__cell ){
    background-color:#fff ;
  }
  :deep(.el-table__body .el-table__row:nth-child(odd) .el-table__cell){
    background-color:#f7f8fa ;
  }
	:deep(.el-table__row--striped td.el-table__cell) {
		background: #fff !important;
	}
	:deep(.el-table__body tr:hover > td.el-table__cell) {
		background: #edf0f2 !important;
	}
}
</style>

<template>
  <!-- 分页组件 -->
  <el-pagination
    :background="true"
    :current-page="pageable.pageNum"
    :page-size="pageable.pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="pageable.total"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup lang="ts" name="Pagination">
interface Pageable {
  pageNum: number;
  pageSize: number;
  total: number;
}

interface PaginationProps {
  pageable: Pageable;
  handleSizeChange: (size: number) => void;
  handleCurrentChange: (currentPage: number) => void;
}

defineProps<PaginationProps>();
</script>

<style lang="scss" scoped>
.el-pagination {
	display: flex;
	justify-content: flex-end;
	padding: 12px 20px;
	// margin-top: 10px;
	background-color: #ffffff;
	:deep(.el-pager li) {
		min-width: 29px;
		height: 29px;
		font-size: 12px;
		color: #3d5266;
		border-radius: 3px;
		border: 1px solid #a3b8cc;
		background-color: #fff !important;
	}
	:deep(.el-pager li.is-active) {
		background-color: #1e8fa0 !important;
	}

	:deep(.el-pager li:hover) {
		background-color: #1e8fa0 !important;
		color: #ffffff;
	}
	:deep(.el-input__wrapper) {
		border-radius: 6px;
		box-shadow: 0 0 0 1px #a3b8cc inset;
		height: 29px;
		padding: 0px 5px;
		line-height: 29px;
	}
	:deep(.el-select .el-input) {
		width: 105px;
	}
	:deep(.el-pagination__editor.el-input) {
		width: 42px;
	}
	:deep(button) {
		min-width: 28px;
		height: 28px;
		border: 1px solid #a3b8cc !important;
	}
}
</style>
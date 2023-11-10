
import TLayoutPage from './layout-page/src/index.vue'
import TLayoutPageItem from './layout-page-item/src/index.vue'
import TQueryCondition from './query-condition/src/index.vue'
import TTable from './table/src/index.vue'
import TForm from './form/src/index.vue'
import TSelect from './select/src/index.vue'
import TSelectTable from './select-table/src/index.vue'
import TDetail from './detail/src/index.vue'
import TButton from './button/src/index.vue'
import TStepWizard from './step-wizard/src/index.vue'
import TTimerBtn from './timer-btn/src/index.vue'
import TModuleForm from './module-form/src/index.vue'
import TAdaptivePage from './adaptive-page/src/index.vue'
import TDatePicker from './date-picker/src/index.vue'
import ProSearch from './proSearch/src/index.vue'
import ProTable from './proTable/index.vue'
import proLoading from './proLoading/index.vue'
import proLayout from './proLayout/index.vue'
declare module 'vue' {
  export interface GlobalComponents {
    TLayoutPage: typeof TLayoutPage
    TLayoutPageItem: typeof TLayoutPageItem
    TQueryCondition: typeof TQueryCondition
    TTable: typeof TTable
    TForm: typeof TForm
    TSelect: typeof TSelect
    TSelectTable: typeof TSelectTable
    TDetail: typeof TDetail
    TButton: typeof TButton
    TStepWizard: typeof TStepWizard
    TTimerBtn: typeof TTimerBtn
    TModuleForm: typeof TModuleForm
    TAdaptivePage: typeof TAdaptivePage
    TDatePicker: typeof TDatePicker,
    ProSearch: typeof ProSearch
    ProTable: typeof ProTable
    ProLoading: typeof proLoading
    proLayout: typeof proLayout
  }
}
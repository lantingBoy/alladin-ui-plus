# TSelect 下拉选择组件

### 单选

:::demo
TSelect/single
:::

### 自定义显示下拉项label

:::demo 设置customLabel字符串表达式：`${item.label}（${item.id}）`;注意：表达式必须以`item`开头，且后面的属性必须存在`optionSource`中
TSelect/customLabel
:::

### 多选

:::demo
TSelect/multiple
:::

### TSelect Attributes

---

### 1、代码示例

> `下拉选择组件————可实现单选多选（多选可使用全选功能）`

```html
<t-select
  placeholder="请选择工序"
  v-model="selectVlaue"
  :optionSource="state.stepList"
  valueKey="label"
  @change="selectChange"
/>
```

### 2、配置参数（Attributes）继承 el-select Attributes

| 参数         | 说明                                             | 类型                            | 默认值  |
| :----------- | :----------------------------------------------- | :------------------------------ | :------ |
| v-model      | 绑定值                                           | boolean / string / number/Array | 无      |
| multiple     | 是否多选                                         | Boolean                         | false   |
| optionSource | 下拉数据源                                       | Array                           | 无      |
| customLabel  | 是否自定义设置下拉label                          | String                          | -       |
| valueKey     | 传入的 option 数组中，要作为最终选择项的键值 key | String                          | 'key'   |
| labelKey     | 传入的 option 数组中，要作为显示项的键值名称     | String                          | 'label' |

### 3、继承 el-select events

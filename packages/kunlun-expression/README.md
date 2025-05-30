# 表达式
提供表达式的字段组件和原生vue组件使用和扩展

### rsql表达式
用于生成rsql条件语句

实现类：`rsqConditionInputControlWidget`

示例语句：`domain="field01=='xxx' and field02==field03"`

###### 应用场景
- 界面设计器复杂字段的下拉选择组件的数据过滤条件设置

### 布尔表达式
用于生成返回布尔值的

实现类：`booleanConditionInputControlWidget`

示例语句：`invisiable=="activeRecord.field001=='xxx' && rootRecord.field02>activeRecord.field002"`

###### 应用场景
- 界面设计器内字段的条件隐藏设置

### 运算表达式

实现类：`expressionInputControlWidget`

示例语句：`activeRecord.field001 + rootRecord.field002`

###### 应用场景
- 界面设计器复杂字段的下拉选择组件的label配置
- 界面设计器字段的动态计算值(computed)

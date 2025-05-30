/**
 * VariableFormInput.vue
 * VariableFormTag.vue
 */
import { Pagination } from '@kunlun/engine';
import { IModelField, ModelFieldType } from '@kunlun/meta';
import { ExtractPropTypes } from '@vue/runtime-core';
import { toString } from 'lodash-es';
import { computed, onMounted, PropType, ref, SetupContext } from 'vue';
import { expFetchFieldSimpleInfo } from '../../../service/modelDefinitionService';
import {
  contextItems2ModelSelection,
  convertModels2FieldSelectionOptions,
  fetchExpressionChildren,
  fetchModelData,
  translateExpValue
} from '../../../share';
import {
  buildSessionContextOptions,
  ElementSize,
  ExpressionDefinitionType,
  ExpressionSeniorMode,
  IExpModel,
  IExpSelectOption,
  IFunFilterMethod,
  IOperatorSelectOption,
  IVariableContextItem,
  IVariableItem,
  RSQL_MATCH_COMPARE_OPERATOR_LIST,
  SessionContextOption,
  VariableItemType
} from '../../../types';

export const IVariableFormProps = {
  expType: String, // 表达式类型
  value: String,
  valueList: Array as PropType<IVariableItem[]>,
  placeholder: String,
  labelViewType: String as PropType<ExpressionSeniorMode>,
  contextItems: Array as PropType<IVariableContextItem[]>,
  models: Array as PropType<string[]>,
  // rsql模式的字段选择所用的模型编码
  fieldModelModel: String,
  // 条件表达式模式的比较操作符
  compareOperatorOption: Object as PropType<IOperatorSelectOption>,
  ttypes: Array as PropType<ModelFieldType[]>,
  isSimpleMode: Boolean,
  useContextName: Boolean,
  // 字段模式下只能输入一个变量
  isFieldMode: Boolean,
  isFieldStore: {
    type: Boolean,
    default: undefined
  },
  // 是否显示VariableItemType的选择器
  showTypeSelect: {
    type: Boolean,
    default: false
  },
  // showType是否显示变量类型
  showVariableType: {
    type: Boolean,
    default: true
  },
  // 是否可以直接选中多对一字段
  canSelectedComplexField: {
    type: Boolean,
    default: false
  },
  // 左边需要连接方的ttype类型，决定了variableItemTypeList中的可选项
  leftJoinTtype: {
    type: String as PropType<ModelFieldType>
  },
  // 运算表达式在确定是给左边枚举/布尔类型字段赋值的时候，传该配置指定可选项
  leftJoinField: {
    type: Object as PropType<IModelField>
  },
  size: {
    type: String as PropType<ElementSize>,
    default: ElementSize.MIDDLE
  },
  filterMethod: Function as PropType<IFunFilterMethod>,
  // 当此项为 true 时，点选每级菜单选项值都会发生变化
  changeOnSelect: {
    type: Boolean,
    default: false
  },
  sessionContextOptions: {
    type: Array as PropType<SessionContextOption[]>
  }
};

export function createEmits() {
  return ['update:value', 'update:valueList', 'change', 'changeList', 'blur', 'changeVariableType'];
}

export function createSetup(props: Readonly<ExtractPropTypes<typeof IVariableFormProps>>, context: SetupContext) {
  const pagination: Pagination = {
    total: 1,
    pageSize: 10,
    current: 1
  } as Pagination;

  let modelList: IExpModel[] = [];

  // 变量用
  const variableOptions = ref<IExpSelectOption[]>([]);
  // 枚举选项用
  const enumOptions = ref<IExpSelectOption[]>([]);
  // rsql模式字段选择用
  const fieldOptions = ref<IExpSelectOption[]>([]);

  const finaleOptions = ref<IExpSelectOption[]>([]);

  const leftJoinTtype = computed((): ModelFieldType | undefined => {
    return props.leftJoinField?.ttype || props.leftJoinTtype;
  });

  let keyword = '';

  const variableType = ref<VariableItemType>();

  const availableOptions = computed<IExpSelectOption[]>(() => {
    let list = finaleOptions.value;
    if ([VariableItemType.VARIABLE, VariableItemType.FIELD].includes(variableType.value!)) {
      if (props.expType === ExpressionDefinitionType.RSQL_CONDITION) {
        // 左边是富文本的情况下，右边也是富文本好像没什么意义
        // 富文本看上去是 ab,实际存储的是 <p>ab</p>，所以导致 根据 <p>ab</a> 匹配不到 <p>abc</a>的数据
        if (
          leftJoinTtype.value == ModelFieldType.HTML &&
          props.compareOperatorOption &&
          RSQL_MATCH_COMPARE_OPERATOR_LIST.includes(toString(props.compareOperatorOption.value))
        ) {
          list = list.filter((a) => a.ttype !== ModelFieldType.HTML);
        }
        list = filterListOption(list);
      } else if (props.expType === ExpressionDefinitionType.BOOLEAN_CONDITION) {
        list = filterListOption(list);
      }
    }
    return list;
  });

  function filterListOption(list: IExpSelectOption[]) {
    if (props.compareOperatorOption?.rightArgMulti) {
      list = list.filter(
        (a) => [ModelFieldType.ManyToMany, ModelFieldType.OneToMany].includes(a.ttype as ModelFieldType) || a.multi
      );
    }
    return list;
  }

  const changeVariableType = async (variableItemType: VariableItemType) => {
    context.emit('changeVariableType', variableItemType);
    variableType.value = variableItemType;
    enumOptions.value = [];
    variableOptions.value = [];
    fieldOptions.value = [];
    if (variableItemType === VariableItemType.FIELD) {
      if (!fieldOptions.value || !fieldOptions.value.length) {
        await fetchModelField();
      }
      finaleOptions.value = fieldOptions.value;
    } else if (variableItemType === VariableItemType.OPTION) {
      await fetchEnumOptions();
      finaleOptions.value = enumOptions.value;
    } else if (variableItemType === VariableItemType.VARIABLE) {
      if (!variableOptions.value || !variableOptions.value.length) {
        await fetchModelDataInner();
      }
      finaleOptions.value = variableOptions.value;
    } else if (variableItemType === VariableItemType.SESSION) {
      finaleOptions.value = [...buildSessionContextOptions(props.sessionContextOptions)];
    }
    // 如果bool类型表达式, 那么从变量数值选项相互切换时, 要清空输入框内容
    // if (props.expType == ExpressionDefinitionType.BOOLEAN_CONDITION && val === VariableItemType.STRING && props.valueList && props.valueList[0]) {
    //   onChangeList([{ varCode: props.valueList[0].varCode, value: '', type: VariableItemType.STRING }]);
    // } else {
    //   onChangeList([]);
    // }
  };

  async function fetchModelDataInner() {
    if (props.contextItems && (props.contextItems.length > 1 || props.useContextName)) {
      // 多个上下文可选变量，先选模型
      variableOptions.value = contextItems2ModelSelection(props.contextItems, props);
    } else {
      // 单个可选变量
      const models = props.models! || props.contextItems?.map((a) => a.models);
      if (!models?.length || props.contextItems?.[0].modelFields?.length) {
        return (variableOptions.value = contextItems2ModelSelection(props.contextItems!, props));
      }
      const queryPageResult = await fetchModelData(models, keyword, pagination, true);
      modelList = (queryPageResult.content || []) as IExpModel[];
      variableOptions.value = convertModels2FieldSelectionOptions(
        modelList,
        props.ttypes,
        props.isFieldStore,
        undefined,
        false,
        props.filterMethod
      );
      if (props.isSimpleMode && variableOptions.value.length) {
        variableOptions.value = variableOptions.value?.[0]?.children || ([] as IExpSelectOption[]);
      }
      pagination.total = queryPageResult.totalElements;
    }
  }

  async function fetchModelField() {
    if (props.fieldModelModel) {
      const queryPageResult = await fetchModelData([props.fieldModelModel], keyword, pagination);
      modelList = queryPageResult.content as IExpModel[];
      const list = convertModels2FieldSelectionOptions(
        modelList,
        props.ttypes,
        props.isFieldStore,
        undefined,
        false,
        props.filterMethod
      );
      if (list && list.length) {
        fieldOptions.value = list[0].children!;
      }
      pagination.total = queryPageResult.totalElements;
    }
  }

  async function fetchEnumOptions() {
    if (props.valueList && props.valueList?.length > 0) {
      if (leftJoinTtype.value === ModelFieldType.Enum) {
        let queryEnumOptions = [] as any[];
        if (props.leftJoinField?.options) {
          queryEnumOptions = props.leftJoinField.options;
        } else {
          const mainModel =
            props.expType === ExpressionDefinitionType.RSQL_CONDITION
              ? props.fieldModelModel
              : props.contextItems?.[0]?.models?.[0];
          if (!mainModel) {
            return;
          }
          const queryFields = await expFetchFieldSimpleInfo(
            props.leftJoinField?.model || mainModel,
            props.leftJoinField?.name
          );
          queryEnumOptions = queryFields.options;
        }
        enumOptions.value.push(
          ...queryEnumOptions.map((queryEnumOption) => {
            return {
              label: translateExpValue(queryEnumOption.displayName),
              displayName: translateExpValue(queryEnumOption.displayName),
              name: queryEnumOption.name,
              value: queryEnumOption.value,
              ttype: ModelFieldType.Enum
            } as IExpSelectOption;
          })
        );
      } else if (leftJoinTtype.value === ModelFieldType.Boolean) {
        enumOptions.value.push(
          ...[
            {
              label: translateExpValue('是'),
              displayName: translateExpValue('是'),
              name: 'true',
              value: 'true',
              ttype: ModelFieldType.Boolean
            } as IExpSelectOption,
            {
              label: translateExpValue('否'),
              displayName: translateExpValue('否'),
              name: 'false',
              value: 'false',
              ttype: ModelFieldType.Boolean
            } as IExpSelectOption
          ]
        );
      }
    }
  }

  async function fetchChildrenInner(selectedOptions: IExpSelectOption[]) {
    await fetchExpressionChildren(selectedOptions, variableOptions.value, props);
  }

  async function onPaginationChange(current, pageSize) {
    pagination.current = current;
    pagination.pageSize = pageSize;
    if (variableType.value === VariableItemType.VARIABLE) {
      fetchModelDataInner();
    } else if (variableType.value === VariableItemType.FIELD) {
      fetchModelField();
    }
  }

  function onKeywordChange(newKeyword) {
    keyword = newKeyword;
    pagination.current = 1;
    if (variableType.value === VariableItemType.VARIABLE) {
      fetchModelDataInner();
    } else if (variableType.value === VariableItemType.FIELD) {
      fetchModelField();
    }
  }

  const onChange = (newVal) => {
    context.emit('update:value', newVal);
    context.emit('change', newVal);
  };
  const onChangeList = (newVal) => {
    context.emit('update:valueList', newVal);
    context.emit('changeList', newVal);
  };

  const variableFormRef = ref(null as any);
  // 获得焦点的节点
  const focusNodes = computed<HTMLElement[]>(() => {
    return [variableFormRef.value.$el, ...variableFormRef.value.focusNodes()] as HTMLElement[];
  });

  const blurHandle = () => {
    context.emit('blur');
  };

  onMounted(() => {
    fetchModelDataInner();
  });
  return {
    modelList,
    pagination,
    finaleOptions,
    availableOptions,
    keyword,
    variableFormRef,
    focusNodes,
    variableType,
    onChange,
    onChangeList,
    fetchModelDataInner,
    fetchChildrenInner,
    onPaginationChange,
    changeVariableType,
    onKeywordChange,
    blurHandle
  };
}

export function createComponent() {
  return {
    emits: createEmits(),
    setup(props, context) {
      return createSetup(props, context);
    },
    onCreated() {}
  };
}

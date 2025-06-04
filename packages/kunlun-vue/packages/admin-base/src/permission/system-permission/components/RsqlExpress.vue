<template>
  <div style="margin: 5px 0 10px 0">
    <span style="margin-right: 5px" class="data-permission-tab-label">{{ $translate('过滤条件') }}</span>
    <span>{{ $translate('在您的数据权限范围内继续设置过滤条件') }}</span>
  </div>
  <condition-input-panel
    :expression-option="expressionOption"
    :expression-item-list="valueList"
    :show-footer="false"
    :disabled="disabled"
    :readonly="readonly"
    :expressMode="expressMode"
    :source-code="sourceCode"
    :onChangeExpressMode="onChangeExpressMode"
    :onChangeSourceCode="onChangeSourceCode"
    @change-expression-items="onChangeList"
  ></condition-input-panel>
</template>
<script lang="ts" setup>
import { translateValueByKey } from '@oinone/kunlun-engine';
import { GraphqlHelper, JSONUtils } from '@oinone/kunlun-shared';
import {
  ConditionInputPanel,
  createConditionExpressionDisplayName,
  createConditionExpressionValue,
  createDefaultExpressionItem,
  CURRENT_USER_BACKEND_EXPRESSION,
  currentUserOption,
  ExpressionDefinitionType,
  ExpressionMode,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType
} from '@oinone/kunlun-vue-expression';
import { computed, defineEmits, defineExpose, defineProps, ref, watch, withDefaults } from 'vue';

const props = withDefaults(
  defineProps<{
    value: string;
    model: string;
    initMode: ExpressionMode | undefined;
    domainExpJson: string;
    readonly: boolean;
    disabled: boolean;
  }>(),
  {
    value: '',
    model: '',
    initMode: undefined,
    domainExpJson: '',
    readonly: false,
    disabled: false
  }
);
const emits = defineEmits(['change']);

const contextItems = ref();
const models = ref<any[]>([]);
const valueList = ref([createDefaultExpressionItem(ExpressionDefinitionType.RSQL_CONDITION)]);
const expressMode = ref<ExpressionMode | undefined>(props.initMode);
const sourceCode = ref<string>(props.value);

const createExpressionOption = (): IExpressionOption => {
  return {
    type: ExpressionDefinitionType.RSQL_CONDITION,
    variableContextItems: contextItems.value!,
    showVariableType: false,
    modelModel: props.model,
    models: models.value,
    quoteType: IExpressionQuoteType.SINGLE,
    variableCustomMethod: (variableStr: string) => {
      return `\${${variableStr}}`;
    },
    sessionContextOptions: [
      {
        ...currentUserOption,
        value: CURRENT_USER_BACKEND_EXPRESSION
      }
    ]
  };
};

const expressionOption = computed(() => {
  return createExpressionOption();
});

const expressionItemsToJSONString = (list: IExpressionItem[]): string => {
  return JSONUtils.toJSONString(list, (k, v) => k === 'expCode' || k === 'varCode');
};

let isChangeMode = false;
let isSaveSourceCode = true;

const onChangeList = (list: IExpressionItem[]) => {
  if (expressMode.value === ExpressionMode.SOURCE) {
    return;
  }
  const changedData = expressionItemsToJSONString(list);
  if (changedData !== expressionItemsToJSONString(valueList.value)) {
    valueList.value = list;
  }
  const exp = createConditionExpressionValue(list, expressionOption.value);
  const expDisplayName = createConditionExpressionDisplayName(
    valueList.value as IExpressionItem[],
    expressionOption.value!
  );
  if (isChangeMode) {
    isChangeMode = false;
  } else {
    sourceCode.value = exp;
    isSaveSourceCode = true;
  }
  emits('change', {
    exp,
    expDisplayName
  });
};

const onChangeSourceCode = (value: string | IExpressionItem[]) => {
  if (typeof value === 'string') {
    isSaveSourceCode = true;
    sourceCode.value = value;
    valueList.value = [createDefaultExpressionItem(ExpressionDefinitionType.RSQL_CONDITION)];
    emits('change', {
      exp: value,
      expDisplayName: value,
      domainExpJson: null
    });
  } else {
    onChangeList(value);
  }
};

const onChangeExpressMode = (value: ExpressionMode) => {
  expressMode.value = value;
  if (value === ExpressionMode.SOURCE) {
    isSaveSourceCode = false;
    emits('change', {
      exp: sourceCode.value,
      expDisplayName: sourceCode.value,
      domainExpJson: null
    });
  } else {
    isChangeMode = true;
    const exp = createConditionExpressionValue(valueList.value, expressionOption.value);
    const expDisplayName = createConditionExpressionDisplayName(
      valueList.value as IExpressionItem[],
      expressionOption.value!
    );
    emits('change', {
      exp,
      expDisplayName
    });
  }
};

watch(
  () => props.model,
  async (model) => {
    contextItems.value = [
      {
        display: translateValueByKey('主视图数据'),
        name: 'activeRecord',
        models: [model]
      }
    ];

    contextItems.value.forEach((a) => {
      if (a.models) {
        models.value.push(...a.models);
      }
    });

    if (props.value && props.domainExpJson) {
      let t = setTimeout(() => {
        const expressItems = JSON.parse(props.domainExpJson);
        valueList.value = expressItems;

        onChangeList(expressItems);
        clearTimeout(t);
        t = null as any;
      });
    } else {
      valueList.value = [createDefaultExpressionItem(ExpressionDefinitionType.RSQL_CONDITION)];
    }
  },
  {
    immediate: true,
    deep: true
  }
);

const submitExp = async () => {
  if (valueList.value && expressionOption.value) {
    if (
      (expressMode.value === ExpressionMode.SOURCE && isSaveSourceCode) ||
      expressionItemsToJSONString([createDefaultExpressionItem(ExpressionDefinitionType.RSQL_CONDITION)]) ===
        expressionItemsToJSONString(valueList.value)
    ) {
      return null;
    }
    return GraphqlHelper.serializableObjectArray(valueList.value!);
  }
  return null;
};

defineExpose({ submitExp });
</script>

<template>
  <div
    class="expression-input-form"
    :class="[
      `expression-input-form-${mode.toLowerCase()}`,
      `expression-input-form-${seniorMode.toLowerCase()}`,
      `expression-input-form-${isLowCode ? 'low-code' : 'no-code'}`
    ]"
  >
    <div class="expression-input-form-header">
      <!--      <div class="expression-input-form-header-title">设置表达式</div>-->
      <div class="expression-input-form-header-switch">
        <a-popconfirm
          :title="translateExpValue('由高级模式切换为快捷模式，将去掉表达式中的决定运算优先级的括号，是否切换?')"
          :visible="visibleConfirm"
          overlay-class-name="expression-switch-popconfirm"
          :ok-text="translateExpValue('确认')"
          :cancel-text="translateExpValue('取消')"
          @visible-change="handleVisibleConfirmChange"
          @confirm="changeMode('QUICK')"
        >
          <span :class="{ active: mode === 'QUICK' }">{{ translateExpValue('快捷') }}</span>
        </a-popconfirm>
        /
        <span :class="{ active: mode === 'SENIOR' }" @click="changeMode('SENIOR')">{{
          translateExpValue('高级')
        }}</span>
        /
        <span :class="{ active: mode === 'SOURCE' }" @click="changeMode('SOURCE')">{{
          translateExpValue('源码')
        }}</span>
      </div>

      <div class="expression-senior-type" v-if="mode === 'SENIOR' && isLowCode">
        <i
          class="d-iconfont oinone-code-mode expression-senior-type-btn"
          :class="{ active: seniorMode === 'API_NAME' }"
          @click="changeSeniorModel('API_NAME')"
        />
        <i
          class="d-iconfont oinone-translate expression-senior-type-btn"
          :class="{ active: seniorMode === 'DISPLAY_NAME' }"
          @click="changeSeniorModel('DISPLAY_NAME')"
        />
      </div>
    </div>
    <!-- 快捷模式 -->
    <div class="expression-input-form-content" v-if="mode === 'QUICK'">
      <div
        class="expression-input-form-content-row expression-quick-item"
        v-for="(expressionItem, index) in expressionItemList"
        :key="index"
      >
        <variable-form-input
          class="expression-input-param"
          v-if="expressionItem.type === 'VARIABLE'"
          v-model:valueList="expressionItem.valueList"
          :canSelectedComplexField="canSelectedComplexField"
          :exp-type="expressionOption.type"
          :placeholder="translateExpValue('请选择变量')"
          :context-items="expressionOption.variableContextItems"
          :left-join-field="expressionOption.leftJoinField"
          :left-join-ttype="expressionOption.leftJoinTtype"
          :ttypes="expressionOption.ttypes"
          :filter-method="filterMethod"
          :models="expressionOption.models"
          :field-model-model="expressionOption.modelModel"
          :is-simple-mode="isSimpleMode"
          :change-on-select="changeVariableOnSelect"
          :use-context-name="expressionOption.useContextName"
          @change-list="(valueList) => valueListChange(valueList, expressionItem)"
        />
        <template v-if="expressionItem.type === 'FUN'">
          <build-in-function-select
            class="expression-input-param expression-input-param-fun"
            v-model:value="expressionItem.value"
            @change-fun="(fun) => onChangeFun(fun, index)"
          />

          <template v-if="expressionItem.function && expressionItem.function.argumentList">
            <variable-form-input
              class="expression-input-param-fun-arg"
              v-for="(arg, argIndex) in expressionItem.function.argumentList"
              :key="argIndex"
              v-model:valueList="arg.variableItemList"
              :exp-type="expressionOption.type"
              :placeholder="arg.name"
              :title="`数据类型:${arg.ttype}`"
              :context-items="expressionOption.variableContextItems"
              :models="expressionOption.models"
              :field-model-model="expressionOption.modelModel"
              :filter-method="filterMethod"
              :is-simple-mode="isSimpleMode"
              :change-on-select="changeVariableOnSelect"
              :use-context-name="expressionOption.useContextName"
            />
          </template>
        </template>

        <a-select
          :allowClear="true"
          class="expression-input-operator"
          dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
          v-if="expressionItem.showOperator"
          v-model:value="expressionItem.operator"
          :dropdown-match-select-width="false"
          :get-popup-container="(triggerNode) => triggerNode.parentNode"
        >
          <a-select-option v-for="item in expressionItem.operatorOptions" :value="item.value" :key="item.value">{{
            translateExpValue(item.label)
          }}</a-select-option>
        </a-select>
        <div class="expression-item-toolbar">
          <a-tooltip :title="translateExpValue('点击添加函数')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-function toolbar-btn" @click="onAddNextFunction(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击添加表达式')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-add toolbar-btn" @click="onAddNextVariable(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击删除行')" v-if="isShowDelete(expressionItem, index)">
            <i class="d-iconfont oinone-shanchu toolbar-btn" @click="onDelete(index)" />
          </a-tooltip>
          <i class="d-iconfont toolbar-btn" v-else />
        </div>
      </div>
    </div>
    <!-- 高级模式 -->
    <div class="expression-input-form-content" v-if="showSeniorMode && mode === 'SENIOR'">
      <div
        class="expression-input-form-content-row expression-senior-item"
        v-for="(expressionItem, index) in expressionItemList"
        :key="index"
        :class="{
          uncheck: !expressionItem.checked,
          'expression-input-form-content-row-empty': expressionItem.isEmptyRow,
          [`expression-item-${expressionItem.type.toLowerCase()}`]: true
        }"
      >
        <a-checkbox
          class="expression-senior-item-checkbox"
          :class="{ 'expression-senior-item-checkbox-hidden': expressionItem.hideCheckbox }"
          v-model:checked="expressionItem.checked"
          :disabled="expressionItem.hideCheckbox"
          @change="onCheck(index)"
        />

        <div class="expression-senior-item-param">
          <span class="expression-input-param-tab" :class="`expression-input-param-tab-${expressionItem.bracketDeep}`">
            <span class="line-num">{{ index + 1 }}</span>
            {{ expressionItem.bracketDeep }}-{{ expressionItem.levelId }}-{{ expressionItem.parentLevelId }}
          </span>
          <template v-if="expressionItem.type === 'VARIABLE'">
            <variable-form-tag
              class="expression-input-param"
              v-if="!expressionItem.showValueListLabel"
              v-model:valueList="expressionItem.valueList"
              :exp-type="expressionOption.type"
              :label-view-type="seniorMode"
              :placeholder="translateExpValue('请选择变量')"
              :context-items="expressionOption.variableContextItems"
              :left-join-ttype="expressionOption.leftJoinTtype"
              :ttypes="expressionOption.ttypes"
              :filter-method="filterMethod"
              :models="expressionOption.models"
              :field-model-model="expressionOption.modelModel"
              :is-simple-mode="isSimpleMode"
              :change-on-select="changeVariableOnSelect"
              :use-context-name="expressionOption.useContextName"
              @change-list="(valueList) => valueListChange(valueList, expressionItem)"
              @blur="valueListBlurHandle(expressionItem)"
            />
            <div
              class="expression-input-param expression-input-param-label"
              v-else
              :class="{
                'expression-input-param-placeholder':
                  !expressionItem.valueListApiName && !expressionItem.valueListDisplayName
              }"
              @click="expressionItem.showValueListLabel = false"
            >
              <template v-if="seniorMode === 'API_NAME'">{{ expressionItem.valueListApiName || '?' }}</template>
              <template v-else>{{ expressionItem.valueListDisplayName || '?' }}</template>
            </div>
          </template>
          <template v-else-if="expressionItem.type === 'FUN'">
            <build-in-function-select
              class="expression-input-param expression-input-param-fun"
              v-model:value="expressionItem.value"
              :show-value-label="seniorMode === 'API_NAME'"
              :allow-clear="false"
              placeholder="?"
              @change-fun="(fun) => onChangeFun(fun, index)"
            />

            <template v-if="expressionItem.function && expressionItem.function.argumentList">
              <span class="expression-item-style-symbol">(</span>
              <span
                class="expression-item-fun-arg"
                v-for="(arg, argIndex) in expressionItem.function.argumentList"
                :key="argIndex"
              >
                <variable-form-tag
                  class="expression-input-param-fun-arg"
                  v-if="!arg.showValueListLabel"
                  v-model:valueList="arg.variableItemList"
                  :exp-type="expressionOption.type"
                  :label-view-type="seniorMode"
                  :placeholder="arg.name"
                  :title="`数据类型:${arg.ttype}`"
                  :context-items="expressionOption.variableContextItems"
                  :filter-method="filterMethod"
                  :models="expressionOption.models"
                  :field-model-model="expressionOption.modelModel"
                  :is-simple-mode="isSimpleMode"
                  :change-on-select="changeVariableOnSelect"
                  :use-context-name="expressionOption.useContextName"
                  @change-list="(valueList) => valueListChange(valueList, arg, true)"
                  @blur="valueListBlurHandle(arg)"
                />
                <a-tooltip :title="arg.name" v-else>
                  <div
                    class="expression-input-param expression-input-param-label"
                    :class="{
                      'expression-input-param-placeholder': !arg.valueListApiName && !arg.valueListDisplayName
                    }"
                    @click="arg.showValueListLabel = false"
                  >
                    <template v-if="seniorMode === 'API_NAME'">{{ arg.valueListApiName || '?' }}</template>
                    <template v-else>{{ arg.valueListDisplayName || '?' }}</template>
                  </div>
                </a-tooltip>

                <span
                  class="expression-item-style-symbol expression-item-fun-split"
                  v-if="argIndex + 1 < expressionItem.function.argumentList.length"
                  >,
                </span>
              </span>

              <span class="expression-item-style-symbol">)</span>
            </template>
          </template>
          <template v-else>
            {{ expressionItem.value }}
          </template>
        </div>

        <!-- START 运算符 -->
        <a-select
          class="expression-input-operator"
          dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
          v-if="expressionItem.showOperator"
          v-model:value="expressionItem.operator"
          :dropdown-match-select-width="false"
          :bordered="false"
          :get-popup-container="(triggerNode) => triggerNode.parentNode"
        >
          <a-select-option v-for="item in expressionItem.operatorOptions" :value="item.value" :key="item.value">{{
            seniorMode === 'DISPLAY_NAME' ? translateExpValue(item.label) : item.value
          }}</a-select-option>
        </a-select>
        <!-- END -->
        <div class="expression-item-toolbar">
          <a-tooltip :title="translateExpValue('点击添加函数')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-function toolbar-btn" @click="onAddNextFunction(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击添加表达式')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-add toolbar-btn" @click="onAddNextVariable(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击添加括号')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-bracket toolbar-btn" @click="onAddNextBrackets(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击删除行')" v-if="isShowDelete(expressionItem, index)">
            <i class="d-iconfont oinone-shanchu toolbar-btn" @click="onDelete(index)" />
          </a-tooltip>
        </div>
      </div>
    </div>
    <!-- 源码模式 -->

    <div class="expression-input-form-content" v-if="mode === 'SOURCE'">
      <oio-textarea :value="sourceCode" @update:value="onChangeSourceCode"></oio-textarea>
    </div>

    <div class="expression-input-form-footer" v-if="showFooter && mode !== 'SOURCE'">
      <span v-if="seniorMode === 'API_NAME' && mode === 'SENIOR'">{{ expressionApiName }}</span>
      <span v-if="seniorMode === 'DISPLAY_NAME' || mode === 'QUICK'">{{ expressionDisplayName }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { ModelFieldType, deepClone, isDateTtype, isEmptyKeObject as isEmptyObject } from '@kunlun/meta';
import { OioTextarea } from '@kunlun/vue-ui-antd';
import {
  Popconfirm as APopconfirm,
  Select as ASelect,
  Tooltip as ATooltip,
  Checkbox as ACheckbox
} from 'ant-design-vue';
import VariableFormInput from '../variable/VariableFormInput.vue';
import VariableFormTag from '../variable/VariableFormTag.vue';
import BuildInFunctionSelect from '../build-in-function-select/BuildInFunctionSelect.vue';
import {
  DEFAULT_EXPRESSION_OPT,
  ExpressionItemType,
  ExpressionMode,
  ExpressionOperatorConfig,
  ExpressionSeniorMode,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IFunction,
  IFunctionArgument,
  IExpSelectOption,
  IVariableItem,
  IFunFilterMethod
} from '../../../types';
import {
  autoSetBracketDeep,
  changeBracketCheckStatus,
  createApiNameVariableListStr,
  createDefaultExpressionLeftBracket,
  createDefaultExpressionRightBracket,
  createDefaultExpressionItem,
  createDefaultVariableItemList,
  createDisplayNameVariableListStr,
  createExpressionApiName,
  createExpressionDisplayName,
  getDefaultOperator,
  getExpressionOperatorOptions,
  isEmptyRow,
  quickMode2SeniorMode,
  recalculateShowOperator,
  seniorMode2quickMode,
  translateExpValue
} from '../../../share';

export default defineComponent({
  inheritAttrs: false,
  components: {
    ACheckbox,
    ASelect,
    ASelectOption: ASelect.Option,
    ATooltip,
    APopconfirm,
    VariableFormInput,
    VariableFormTag,
    BuildInFunctionSelect,
    OioTextarea
  },
  props: {
    sourceCode: String,
    hasChangeSourceCode: Boolean,
    expressionItemList: Array as PropType<IExpressionItem[]>,
    expressionOption: {
      type: Object as PropType<IExpressionOption>,
      required: true,
      default: () => {}
    },
    filterMethod: Function as PropType<IFunFilterMethod>,
    isSimpleMode: Boolean,
    useContextName: Boolean,
    models: Array as PropType<string[]>,
    fieldOptions: {
      type: Array as PropType<IExpSelectOption[]>,
      default: () => []
    },
    isLowCode: {
      type: Boolean,
      default: true
    },
    showSeniorMode: {
      type: Boolean,
      default: true
    },
    canSelectedComplexField: {
      type: Boolean,
      default: false
    },
    // 当此项为 true 时，变量点选每级菜单选项值都会发生变化
    changeVariableOnSelect: {
      type: Boolean,
      default: false
    },
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change', 'change-list', 'update:value', 'update:expressionItemList', 'change-source-code', 'clear'],
  setup(props, context) {
    const expressionOption = computed(() => {
      return {
        useContextName: props.useContextName,
        ...props.expressionOption
      } as IExpressionOption;
    });

    const operatorOptions = ref(ExpressionOperatorConfig);
    const mode = ref<ExpressionMode>(ExpressionMode.QUICK);
    const seniorMode = ref<ExpressionSeniorMode>(ExpressionSeniorMode.DISPLAY_NAME);
    const visibleConfirm = ref<boolean>(false);

    const changeMode = (newMode: ExpressionMode) => {
      if (newMode === ExpressionMode.QUICK) {
        expressionItemList.value = seniorMode2quickMode(expressionItemList.value);
      } else if (newMode === ExpressionMode.SENIOR) {
        quickMode2SeniorMode(expressionItemList.value, props.expressionOption.variableContextItems!);
      }
      mode.value = newMode;
    };
    const optOptionLabelProp = computed(() => {
      return seniorMode.value === ExpressionSeniorMode.API_NAME ? 'value' : 'label';
    });

    const isHasBracket = () => {
      return (
        mode.value === ExpressionMode.SENIOR &&
        expressionItemList.value.filter((a) => a.type === ExpressionItemType.LEFT_BRACKET).length > 0
      );
    };

    const handleVisibleConfirmChange = (visible: boolean) => {
      if (!visible) {
        visibleConfirm.value = false;
        return;
      }
      if (!isHasBracket() && !expressionItemList.value.find((a) => !a.checked)) {
        changeMode(ExpressionMode.QUICK);
      } else {
        visibleConfirm.value = true;
      }
    };

    const changeSeniorModel = (newMode: ExpressionSeniorMode) => {
      seniorMode.value = newMode;
    };

    // 快捷方式的存储
    const expressionItemList = ref<IExpressionItem[]>([]);
    // expressionItemList.value = [createDefaultExpressionItem(props.expressionOption.type)] as IExpressionItem[];

    const isShowAddNext = (expressionItem: IExpressionItem) => {
      return expressionItem && expressionItem.type !== ExpressionItemType.LEFT_BRACKET;
    };
    const isShowDelete = (expressionItem: IExpressionItem, index: number) => {
      return !(
        expressionItemList.value.length <= 1 ||
        (expressionItem && expressionItem.type === ExpressionItemType.RIGHT_BRACKET)
      );
    };
    const onAddNextFunction = (index) => {
      onAddNext(index, ExpressionItemType.FUN);
    };
    const onAddNextVariable = (index) => {
      onAddNext(index, ExpressionItemType.VARIABLE);
    };
    const onAddNextBrackets = (index) => {
      onAddNext(index, ExpressionItemType.BRACKETS);
    };

    const onChangeSourceCode = (code: string | IExpressionItem[]) => {
      context.emit('change-source-code', code);
    };

    const onAddNext = (index, expressionItemType: ExpressionItemType) => {
      const currentExpressionItem = expressionItemList.value[index];
      if (currentExpressionItem.type !== ExpressionItemType.LEFT_BRACKET) {
        currentExpressionItem.showOperator = true;
        currentExpressionItem.operator =
          currentExpressionItem.operator || getDefaultOperator(props.expressionOption!.type!);
      }
      // 总列表的最后一个 或者 括号内的最后一个
      const isHideOperator =
        index === expressionItemList.value.length - 1 ||
        (expressionItemList.value[index + 1] &&
          expressionItemList.value[index + 1].type === ExpressionItemType.RIGHT_BRACKET);

      const beforeList = [...expressionItemList.value.slice(0, index)];
      beforeList.reverse();
      if (expressionItemType === ExpressionItemType.BRACKETS) {
        expressionItemList.value.splice(
          index + 1,
          0,
          {
            ...createDefaultExpressionLeftBracket(props.expressionOption.type!)
          },
          {
            ...createDefaultExpressionItem(props.expressionOption.type!),
            showValueListLabel: mode.value === ExpressionMode.SENIOR,
            isEmptyRow: mode.value === ExpressionMode.SENIOR,
            hideCheckbox: mode.value === ExpressionMode.SENIOR,
            checked: mode.value !== ExpressionMode.SENIOR
          },
          {
            ...createDefaultExpressionRightBracket(props.expressionOption.type!, isHideOperator)
          }
        );
      } else {
        expressionItemList.value.splice(index + 1, 0, {
          ...createDefaultExpressionItem(props.expressionOption.type!),
          type: expressionItemType,
          valueList: expressionItemType === ExpressionItemType.VARIABLE ? createDefaultVariableItemList() : [],
          showValueListLabel: mode.value === ExpressionMode.SENIOR,
          isEmptyRow: false,
          showOperator: !isHideOperator
        });
      }
      recalculateShowOperator(expressionItemList.value, props.expressionOption!);
    };

    const onCheck = (index) => {
      changeBracketCheckStatus(index, expressionItemList.value, props.expressionOption!);
    };

    const onDelete = (index) => {
      if (expressionItemList.value.length < 2) {
        return;
      }
      const isLast = index === expressionItemList.value.length - 1;
      const expressionItem = expressionItemList.value[index];
      expressionItemList.value.splice(index, 1);
      if (expressionItem.type === ExpressionItemType.LEFT_BRACKET) {
        // 如果删除的是左括号，需要删除对应的右括号
        const rightBracketIndex = expressionItemList.value.findIndex(
          (a) => a.type === ExpressionItemType.RIGHT_BRACKET && a.levelId === expressionItem.levelId
        );
        expressionItemList.value.splice(rightBracketIndex, 1);
      }
      if (index > 0 && isLast) {
        const prevExpressItem = expressionItemList.value[index - 1];
        prevExpressItem.showOperator = false;
        prevExpressItem.operator = DEFAULT_EXPRESSION_OPT;
      }
      if (mode.value === ExpressionMode.SENIOR) {
        autoSetBracketDeep(expressionItemList.value);
      }
      recalculateShowOperator(expressionItemList.value, props.expressionOption!);
    };
    const onChangeFun = (fun: IFunction, index: number) => {
      const expressionItem = expressionItemList.value[index];
      expressionItem.function = fun;
      expressionItem.operatorOptions = getExpressionOperatorOptions({
        ttype: fun?.returnType?.ttype!
      } as unknown as IVariableItem);
      expressionItem.operator = expressionItem.operatorOptions && (expressionItem.operatorOptions[0].value as string);
    };

    let isInit = false;
    let oldValueList = [];
    watch(
      () => props.expressionItemList,
      (newVal) => {
        expressionItemList.value = newVal || [createDefaultExpressionItem(props.expressionOption.type!)];

        if (!isInit && !oldValueList?.length) {
          const existing = expressionItemList.value.some((v) => v.valueApiName);

          if (!existing && props.hasChangeSourceCode) {
            changeMode(ExpressionMode.SOURCE);
          }
        }

        if (
          !isInit &&
          !oldValueList?.length &&
          expressionItemList.value.findIndex(
            (a) => a.type === ExpressionItemType.RIGHT_BRACKET || a.type === ExpressionItemType.LEFT_BRACKET
          ) > -1
        ) {
          // 第一次初始化的时候需要自动切换高级模式，这里容易无限循环调用，小心！
          if (mode.value !== ExpressionMode.SENIOR) {
            isInit = true;
            changeMode(ExpressionMode.SENIOR);
          }
        }

        oldValueList = deepClone(newVal);
      },
      { immediate: true, deep: true }
    );

    watch(
      expressionItemList,
      (newVal) => {
        context.emit('change-list', newVal);
        context.emit('update:expressionItemList', newVal);
      },
      { deep: true }
    );
    const expressionDisplayName = computed(() => {
      return createExpressionDisplayName(expressionItemList.value as IExpressionItem[], props.expressionOption!);
    });
    const expressionApiName = computed(() => {
      return createExpressionApiName(expressionItemList.value as IExpressionItem[], props.expressionOption!);
    });

    function valueListChange(
      valueList: IVariableItem[],
      expressionItem: IExpressionItem | IFunctionArgument,
      isArg = false
    ) {
      expressionItem.valueListDisplayName = createDisplayNameVariableListStr(valueList!, {
        ...props.expressionOption!,
        isBetweenInBrackets: true,
        quoteType: IExpressionQuoteType.SINGLE
      } as IExpressionOption);
      expressionItem.valueListApiName = createApiNameVariableListStr(valueList!, {
        ...props.expressionOption!,
        isBetweenInBrackets: true,
        quoteType: IExpressionQuoteType.SINGLE
      } as IExpressionOption);
      if (!isArg) {
        expressionItem = expressionItem as IExpressionItem;
        const isEmpty = isEmptyRow(expressionItem as IExpressionItem);
        expressionItem.isEmptyRow = isEmpty;
        expressionItem.hideCheckbox = isEmpty;

        const validList = valueList.filter((a) => !isEmptyObject(a.value));
        if (validList && validList.length === 1) {
          expressionItem.operatorOptions = getExpressionOperatorOptions({
            ttype: validList[0]?.ttype!
          } as unknown as IVariableItem);
        } else {
          expressionItem.operatorOptions = getExpressionOperatorOptions();
        }
        const { operator } = expressionItem;
        if (
          expressionItem.operatorOptions &&
          expressionItem.operatorOptions.findIndex((a) => a.value === operator) === -1
        ) {
          expressionItem.operator = expressionItem.operatorOptions
            ? (expressionItem.operatorOptions[0].value as string)
            : '';
        }
      }
    }
    const valueListBlurHandle = (expressionItem: IExpressionItem | IFunctionArgument) => {
      expressionItem.showValueListLabel = !expressionItem.showValueListLabel;
    };

    function createArgTtypes(ttype: ModelFieldType): ModelFieldType[] {
      if (ttype === ModelFieldType.OBJ) {
        return [];
      }
      return isDateTtype(ttype)
        ? [ModelFieldType.DateTime, ModelFieldType.Date, ModelFieldType.Time, ModelFieldType.Year]
        : [ttype];
    }

    watch(
      () => expressionApiName.value,
      (val) => {
        val && onChangeSourceCode(expressionItemList.value);
      }
    );

    return {
      expressionOption,
      expressionItemList,
      operatorOptions,
      mode,
      seniorMode,
      visibleConfirm,
      optOptionLabelProp,
      expressionDisplayName,
      expressionApiName,
      isShowAddNext,
      isShowDelete,
      handleVisibleConfirmChange,
      changeMode,
      changeSeniorModel,
      onAddNextFunction,
      onAddNextVariable,
      onAddNextBrackets,
      onCheck,
      onDelete,
      onChangeFun,
      valueListBlurHandle,
      valueListChange,
      createArgTtypes,
      translateExpValue,
      onChangeSourceCode
    };
  }
});
</script>

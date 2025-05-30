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
      <!--      <div class="expression-input-form-header-title">设置条件</div>-->
      <div class="expression-input-form-header-switch">
        <a-popconfirm
          :title="translateExpValue('由高级模式切换为快捷模式，将去掉条件中的括号和未选中行，是否切换？')"
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
    <!--  快捷模式  -->
    <div class="expression-input-form-content" v-if="mode === 'QUICK'">
      <div
        class="expression-input-form-content-row expression-quick-item"
        v-for="(expressionItem, index) in expressionItemList"
        :key="index"
      >
        <template v-if="expressionItem.type === 'VARIABLE'">
          <model-field-select-control
            class="expression-input-param"
            v-model:valueList="expressionItem.valueList"
            :placeholder="translateExpValue('请选择条件字段')"
            :is-simple-mode="false"
            :is-field-store="isFieldStore"
            :model="expressionOption.modelModel"
            :context-items="modelFieldContextItems"
            :is-rsql-field="isRsqlExp"
            :use-context-name="isRsqlExp ? false : expressionOption.useContextName"
            :ttypes="expressionOption.ttypes"
            :filter-method="filterMethod"
            @change-list="(valueList) => onChangeField(valueList, expressionItem)"
          />
          <a-select
            class="expression-input-operator"
            dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
            v-model:value="expressionItem.compareOperator"
            :get-popup-container="null"
            @change="changeHandler"
          >
            <a-select-option
              v-for="item in expressionItem.compareOperatorOptions"
              :value="item.value"
              :key="item.value"
              :title="translateExpValue(item.label)"
              >{{ translateExpValue(item.label) }}
            </a-select-option>
          </a-select>

          <variable-form-input
            class="expression-input-param"
            v-if="isCanShowCompareValue(expressionItem)"
            v-model:valueList="expressionItem.compareValueList"
            :exp-type="expressionOption.type"
            :placeholder="expressionItem.valueList && expressionItem.valueList.length > 1 ? '' : '请选择变量'"
            :context-items="expressionOption.variableContextItems"
            :ttypes="expressionOption.ttypes"
            :filter-method="filterMethod"
            :models="expressionOption.models"
            :field-model-model="expressionOption.modelModel"
            :compare-operator-option="createExpressionItemCompareOperatorOption(expressionItem)"
            :is-simple-mode="isSimpleMode"
            :use-context-name="expressionOption.useContextName"
            is-field-mode
            :is-field-store="isFieldStore"
            :min-variable-num="1"
            :max-variable-num="1"
            :show-type-select="true"
            :show-variable-type="expressionOption.showVariableType"
            :session-context-options="expressionOption.sessionContextOptions"
            :left-join-field="createExpressionItemLeftJoinField(expressionItem)"
            :left-join-ttype="
              expressionItem.valueList && expressionItem.valueList.length ? expressionItem.valueList[0].ttype : ''
            "
            @change-variable-type="(variableType) => changeVariableTypeHandle(variableType, expressionItem)"
            @change-list="changeHandler"
          />
          <div v-else class="expression-input-param"></div>
        </template>
        <logic-operator-select
          class="expression-input-operator"
          v-if="expressionItem.showOperator"
          :options="operatorOptions"
          v-model:value="expressionItem.operator"
          @change="changeHandler"
        />
        <div v-else class="logic-operator-select logic-operator-select-blank expression-input-operator"></div>

        <div class="expression-item-toolbar">
          <a-tooltip :title="translateExpValue('点击添加条件')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-add toolbar-btn" @click="onAddNextVariable(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击删除条件')" v-if="isShowDelete(expressionItem, index)">
            <i class="d-iconfont oinone-shanchu toolbar-btn" @click="onDelete(index)" />
          </a-tooltip>
          <i class="d-iconfont toolbar-btn" v-else />
        </div>
      </div>
    </div>
    <!--  高级模式  -->
    <div class="expression-input-form-content" v-if="mode === 'SENIOR'">
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
            <model-field-select-control
              class="expression-input-param"
              v-model:valueList="expressionItem.valueList"
              :label-view-type="seniorMode"
              placeholder="?"
              :is-simple-mode="false"
              :is-rsql-field="isRsqlExp"
              :is-field-store="isFieldStore"
              :model="expressionOption.modelModel"
              :context-items="modelFieldContextItems"
              :use-context-name="isRsqlExp ? false : expressionOption.useContextName"
              :ttypes="expressionOption.ttypes"
              :filter-method="filterMethod"
              @change-list="(valueList) => onChangeField(valueList, expressionItem)"
            />
            <a-select
              class="expression-input-compare-operator expression-input-operator"
              dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
              v-model:value="expressionItem.compareOperator"
              :dropdown-match-select-width="false"
              :bordered="false"
              :get-popup-container="null"
              @change-list="changeHandler"
            >
              <a-select-option
                v-for="item in expressionItem.compareOperatorOptions"
                :value="item.value"
                :key="item.value"
                :title="seniorMode === 'DISPLAY_NAME' ? translateExpValue(item.label) : item.value"
                >{{ seniorMode === 'DISPLAY_NAME' ? translateExpValue(item.label) : item.value }}
              </a-select-option>
            </a-select>

            <template v-if="isCanShowCompareValue(expressionItem)">
              <variable-form-tag
                class="expression-input-param"
                v-if="!expressionItem.showCompareValueListLabel"
                v-model:valueList="expressionItem.compareValueList"
                :exp-type="expressionOption.type"
                :label-view-type="seniorMode"
                :placeholder="expressionItem.valueList && expressionItem.valueList.length > 1 ? '' : '请选择变量'"
                :context-items="expressionOption.variableContextItems"
                :ttypes="expressionOption.ttypes"
                :filter-method="filterMethod"
                :models="expressionOption.models"
                :field-model-model="expressionOption.modelModel"
                :compare-operator-option="createExpressionItemCompareOperatorOption(expressionItem)"
                :is-simple-mode="isSimpleMode"
                :use-context-name="expressionOption.useContextName"
                is-field-mode
                :is-field-store="isFieldStore"
                size="small"
                :min-variable-num="1"
                :max-variable-num="1"
                :show-type-select="true"
                :show-variable-type="expressionOption.showVariableType"
                :left-join-field="createExpressionItemLeftJoinField(expressionItem)"
                :left-join-ttype="
                  expressionItem.valueList && expressionItem.valueList.length ? expressionItem.valueList[0].ttype : ''
                "
                @change-list="(compareValueList) => compareValueListChange(compareValueList, expressionItem)"
                @blur="compareValueListBlurHandle(expressionItem)"
                @change-variable-type="(variableType) => changeVariableTypeHandle(variableType, expressionItem)"
              />

              <div
                class="expression-input-param expression-input-param-label"
                v-else
                :class="{
                  'expression-input-param-placeholder':
                    !expressionItem.compareValueListApiName && !expressionItem.compareValueListDisplayName
                }"
                @click="expressionItem.showCompareValueListLabel = false"
              >
                <template v-if="seniorMode === 'API_NAME'"
                  >{{ expressionItem.compareValueListApiName || '?' }}
                </template>
                <template v-else>{{ expressionItem.compareValueListDisplayName || '?' }}</template>
              </div>
            </template>
            <div v-else class="expression-input-param"></div>
          </template>
          <template v-else>
            {{ expressionItem.value }}
          </template>
        </div>

        <logic-operator-select
          class="expression-input-operator"
          v-if="expressionItem.showOperator"
          :show-value-label="seniorMode === 'API_NAME'"
          :options="operatorOptions"
          v-model:value="expressionItem.operator"
          @change="changeHandler"
        />
        <div v-else class="expression-input-operator"></div>
        <div class="expression-item-toolbar">
          <a-tooltip :title="translateExpValue('点击添加条件')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-add toolbar-btn" @click="onAddNextVariable(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击添加括号')" v-if="isShowAddNext(expressionItem)">
            <i class="d-iconfont oinone-circle-bracket toolbar-btn" @click="onAddNextBrackets(index)" />
          </a-tooltip>
          <a-tooltip :title="translateExpValue('点击删除条件')" v-if="isShowDelete(expressionItem, index)">
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
import { deepClone, IModelField, isComplexTtype } from '@kunlun/meta';
import { OioTextarea } from '@kunlun/vue-ui-antd';
import {
  Checkbox as ACheckbox,
  Popconfirm as APopconfirm,
  Select as ASelect,
  Tooltip as ATooltip
} from 'ant-design-vue';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import {
  autoSetBracketDeep,
  changeBracketCheckStatus,
  createApiNameVariableListStr,
  createConditionExpressionApiName,
  createConditionExpressionDisplayName,
  createDefaultExpressionItem,
  createDefaultExpressionLeftBracket,
  createDefaultExpressionRightBracket,
  createDefaultFieldVariableItems,
  createDefaultVariableItemList,
  createDisplayNameVariableListStr,
  getDefaultCompareOperatorOptions,
  getDefaultOperator,
  isEmptyRow,
  isNoRightCompareExpOperator,
  isOneArgFunExpOperator,
  quickMode2SeniorMode,
  recalculateShowOperator,
  seniorMode2quickMode,
  translateExpValue
} from '../../../share';

import {
  ExpressionBooleanLogicOperatorList,
  ExpressionDefinitionType,
  ExpressionItemType,
  ExpressionMode,
  ExpressionRsqlLogicOperatorList,
  ExpressionSeniorMode,
  IExpressionItem,
  IExpressionOption,
  IExpSelectOption,
  IFunFilterMethod,
  IOperatorSelectOption,
  IVariableItem,
  VariableItemType
} from '../../../types';
import ModelFieldSelectControl from '../../model-field-select/ModelFieldSelectControl.vue';
import LogicOperatorSelect from '../logic-operator-select/LogicOperatorSelect.vue';

import VariableFormInput from '../variable/VariableFormInput.vue';
import VariableFormTag from '../variable/VariableFormTag.vue';

export default defineComponent({
  inheritAttrs: false,
  components: {
    OioTextarea,
    ACheckbox,
    ASelect,
    ASelectOption: ASelect.Option,
    ATooltip,
    APopconfirm,
    VariableFormInput,
    VariableFormTag,
    LogicOperatorSelect,
    ModelFieldSelectControl
  },
  props: {
    mode: {
      type: String as PropType<ExpressionMode>,
      default: undefined
    },
    sourceCode: String,
    hasChangeSourceCode: Boolean,
    value: String,
    expressionItemList: Array as PropType<IExpressionItem[]>,
    // contextItems: Array as PropType<IVariableContextItem[]>,
    // quoteType: String as PropType<IExpressionQuoteType>,
    // ttypes: Array as PropType<ModelFieldType[]>,
    // type: String as PropType<ExpressionDefinitionType>,
    expressionOption: {
      type: Object as PropType<IExpressionOption>,
      required: true,
      default: () => {}
    },
    filterMethod: Function as PropType<IFunFilterMethod>,
    isFieldStore: {
      type: Boolean,
      default: undefined
    },
    isSimpleMode: Boolean,
    fieldOptions: {
      type: Array as PropType<IExpSelectOption[]>,
      default: () => []
    },
    isLowCode: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'change',
    'change-list',
    'update:value',
    'update:mode',
    'update:expressionItemList',
    'change-source-code',
    'clear'
  ],
  setup(props, context) {
    // 查询条件控件记录了一个位置，默认从第一个字段开始，每增加一行初始表达式行，位置按照模型中字段顺序下移一位，初始表达式行的字段控件默认值为当前位置的字段）
    // 页面刚进来第1位已经使用了
    let currentFieldIndex = 1;

    const operatorOptions = ref(
      props.expressionOption!.type === ExpressionDefinitionType.RSQL_CONDITION
        ? ExpressionRsqlLogicOperatorList
        : ExpressionBooleanLogicOperatorList
    );
    const internalMode = ref<ExpressionMode>(ExpressionMode.QUICK);
    const mode = computed<ExpressionMode>({
      get() {
        return props.mode || internalMode.value;
      },
      set(val) {
        internalMode.value = val;
        context.emit('update:mode', val);
      }
    });
    const seniorMode = ref<ExpressionSeniorMode>(ExpressionSeniorMode.DISPLAY_NAME);
    const visibleConfirm = ref<boolean>(false);
    const modelFieldContextItems = computed(() => {
      if (props.expressionOption.type === ExpressionDefinitionType.RSQL_CONDITION) {
        return [{ models: [props.expressionOption.modelModel] }];
      }
      return props.expressionOption.variableContextItems;
    });

    const changeMode = (newMode: ExpressionMode) => {
      if (newMode === ExpressionMode.QUICK) {
        expressionItemList.value = seniorMode2quickMode(expressionItemList.value);
      } else if (newMode === ExpressionMode.SENIOR) {
        quickMode2SeniorMode(expressionItemList.value, props.expressionOption!.variableContextItems);
      }
      mode.value = newMode;
    };
    const optOptionLabelProp = computed(() => {
      return seniorMode.value === ExpressionSeniorMode.API_NAME ? 'value' : 'label';
    });

    const isRsqlExp = computed(() => {
      return props.expressionOption.type == ExpressionDefinitionType.RSQL_CONDITION;
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

    const onChangeSourceCode = (code: string | IExpressionItem[]) => {
      context.emit('change-source-code', code);
    };

    // 快捷方式的存储
    const expressionItemList = ref<IExpressionItem[]>([]);
    // expressionItemList.value = [createDefaultExpressionItem(props.type)] as IExpressionItem[];

    const isShowAddNext = (expressionItem: IExpressionItem) => {
      return expressionItem && expressionItem.type !== ExpressionItemType.LEFT_BRACKET;
    };
    const isShowDelete = (expressionItem: IExpressionItem, index: number) => {
      return !(expressionItemList.value.length <= 1 || expressionItem.type === ExpressionItemType.RIGHT_BRACKET);
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
            showCompareValueListLabel: mode.value === ExpressionMode.SENIOR,
            isEmptyRow: mode.value === ExpressionMode.SENIOR,
            hideCheckbox: mode.value === ExpressionMode.SENIOR,
            checked: mode.value !== ExpressionMode.SENIOR
          },
          {
            ...createDefaultExpressionRightBracket(props.expressionOption.type!, isHideOperator)
          }
        );
      } else {
        if (currentFieldIndex > props.fieldOptions!.length - 1) {
          currentFieldIndex = 0;
        }
        const valueList =
          expressionItemType === ExpressionItemType.VARIABLE
            ? createDefaultFieldVariableItems(props.fieldOptions!, currentFieldIndex)
            : [];
        const nextExpressionItem = {
          ...createDefaultExpressionItem(props.expressionOption.type!),
          type: expressionItemType,
          // 默认字段
          valueList,
          compareValueList: expressionItemType === ExpressionItemType.VARIABLE ? createDefaultVariableItemList() : [],
          showCompareValueListLabel: mode.value === ExpressionMode.SENIOR,
          isEmptyRow: false,
          showOperator: !isHideOperator
        };
        if (valueList && valueList.length && expressionItemType === ExpressionItemType.VARIABLE) {
          nextExpressionItem.compareOperatorOptions = getDefaultCompareOperatorOptions(
            props.expressionOption.type,
            valueList[0]
          );
        }
        expressionItemList.value.splice(index + 1, 0, nextExpressionItem);
        currentFieldIndex++;
      }
      if (mode.value === ExpressionMode.SENIOR) {
        setTimeout(() => {
          autoSetBracketDeep(expressionItemList.value);
          recalculateShowOperator(expressionItemList.value, props.expressionOption!);
        }, 200);
      } else {
        recalculateShowOperator(expressionItemList.value, props.expressionOption!);
      }
      changeHandler();
    };

    const onCheck = (index) => {
      changeBracketCheckStatus(index, expressionItemList.value, props.expressionOption!);
      changeHandler();
    };

    const onDelete = (index) => {
      if (expressionItemList.value.length < 2) {
        return;
      }
      const isLast = index === expressionItemList.value.length - 1;
      const expressionItem = expressionItemList.value[index];
      const nextExpressionItem = expressionItemList.value[index + 1];
      expressionItemList.value.splice(index, 1);
      if (expressionItem.type === ExpressionItemType.LEFT_BRACKET) {
        // 如果删除的是左括号，需要删除对应的右括号
        const rightBracketIndex = expressionItemList.value.findIndex(
          (a) => a.type === ExpressionItemType.RIGHT_BRACKET && a.levelId === expressionItem.levelId
        );
        expressionItemList.value.splice(rightBracketIndex, 1);
      }
      const nextIsRightBracket =
        !isLast && nextExpressionItem && nextExpressionItem.type === ExpressionItemType.RIGHT_BRACKET;
      // 全部的最后一个 或者 括号内的最后一个表达式行
      if (index > 0 && (isLast || nextIsRightBracket)) {
        const prevExpressItem = expressionItemList.value[index - 1];
        if (prevExpressItem.type !== ExpressionItemType.LEFT_BRACKET) {
          prevExpressItem.showOperator = false;
          prevExpressItem.operator = getDefaultOperator(props.expressionOption.type!);
        }
      }
      if (mode.value === ExpressionMode.SENIOR) {
        autoSetBracketDeep(expressionItemList.value);
      }
      recalculateShowOperator(expressionItemList.value, props.expressionOption!);
      changeHandler();
    };

    let isInit = false;
    let oldValueList = [];
    watch(
      () => props.expressionItemList,
      (newVal, oldVal) => {
        if (!isInit && !oldValueList?.length) {
          const existing = expressionItemList.value.some((v) => v.valueApiName);

          if (!existing && props.hasChangeSourceCode) {
            changeMode(ExpressionMode.SOURCE);
          }
        }

        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
          return;
        }
        expressionItemList.value = newVal || [createDefaultExpressionItem(props.expressionOption.type!)];
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
        context.emit('change-list', expressionItemList.value);
        context.emit('update:expressionItemList', expressionItemList.value);
      },
      { deep: true }
    );

    function changeHandler() {
      // nextTick(() => {
      //   context.emit('change-list', expressionItemList.value);
      //   context.emit('update:expressionItemList', expressionItemList.value);
      // });
    }

    const expressionDisplayName = computed(() => {
      return createConditionExpressionDisplayName(
        expressionItemList.value as IExpressionItem[],
        props.expressionOption!
      );
    });
    const expressionApiName = computed(() => {
      return createConditionExpressionApiName(expressionItemList.value as IExpressionItem[], props.expressionOption!);
    });

    const changeVariableTypeHandle = (variableItemType: VariableItemType, expressionItem: IExpressionItem) => {
      autoSetCompareOperator(expressionItem.valueList!, expressionItem, variableItemType);
    };

    function autoSetCompareOperator(
      valueList: IVariableItem[],
      expressionItem: IExpressionItem,
      variableItemType?: VariableItemType
    ) {
      if (!valueList?.length) {
        return;
      }
      const variableItem = valueList[0];
      expressionItem.compareOperatorOptions = getDefaultCompareOperatorOptions(
        props.expressionOption!.type!,
        variableItem,
        variableItemType
      );
      if (
        expressionItem.compareOperatorOptions &&
        expressionItem.compareOperatorOptions.findIndex((a) => a.value === expressionItem.compareOperator) === -1
      ) {
        expressionItem.compareOperator = expressionItem.compareOperatorOptions?.length
          ? (expressionItem.compareOperatorOptions[0].value as string)
          : '';
      }
    }

    const onChangeField = (valueList: IVariableItem[], expressionItem: IExpressionItem) => {
      valueListChange(valueList, expressionItem);
      if (!valueList?.length) {
        changeHandler();
        return;
      }
      autoSetCompareOperator(valueList, expressionItem);
      expressionItem.compareValueList = createDefaultVariableItemList();
      changeHandler();
    };
    const isCanShowCompareValue = (expressionItem: IExpressionItem) => {
      return !(
        isNoRightCompareExpOperator(expressionItem.compareOperator!, props.expressionOption!) ||
        isOneArgFunExpOperator(expressionItem.compareOperator!, props.expressionOption!)
      );
    };

    function valueListChange(valueList: IVariableItem[], expressionItem: IExpressionItem) {
      expressionItem.valueListDisplayName = createDisplayNameVariableListStr(valueList!, props.expressionOption!);
      expressionItem.valueListApiName = createApiNameVariableListStr(valueList!, props.expressionOption!);

      const isEmpty = isEmptyRow(expressionItem);
      expressionItem.isEmptyRow = isEmpty;
      expressionItem.hideCheckbox = isEmpty;
    }

    function compareValueListChange(valueList: IVariableItem[], expressionItem: IExpressionItem) {
      expressionItem.compareValueListDisplayName = createDisplayNameVariableListStr(
        valueList!,
        props.expressionOption!
      );
      expressionItem.compareValueListApiName = createApiNameVariableListStr(valueList!, props.expressionOption!);

      const isEmpty = isEmptyRow(expressionItem);
      expressionItem.isEmptyRow = isEmpty;
      expressionItem.hideCheckbox = isEmpty;

      changeHandler();
    }

    const compareValueListBlurHandle = (expressionItem: IExpressionItem) => {
      expressionItem.showCompareValueListLabel = !expressionItem.showCompareValueListLabel;
    };

    watch(
      () => expressionApiName.value,
      (val) => {
        val && onChangeSourceCode(expressionItemList.value);
      }
    );

    function createExpressionItemCompareOperatorOption(expressionItem: IExpressionItem): IOperatorSelectOption {
      const { compareOperatorOptions = [] } = expressionItem;
      return compareOperatorOptions.find((a) => a.value === expressionItem.compareOperator)!;
    }

    function createExpressionItemLeftJoinField(expressionItem: IExpressionItem): IModelField {
      if (expressionItem.valueList && expressionItem.valueList.length) {
        const field = expressionItem.valueList[0];
        if (!field.value) {
          return undefined as any as IModelField;
        }
        let modelModel = props.expressionOption.modelModel;
        const valueArr = field.value.split('.');
        const fieldName = valueArr[valueArr.length - 1];
        if (props.expressionOption.type === ExpressionDefinitionType.BOOLEAN_CONDITION && valueArr.length > 1) {
          const modelContextName = valueArr[0];
          const contextItem = props.expressionOption.variableContextItems.find((a) => a.name === modelContextName);
          if (contextItem) {
            modelModel = contextItem.models && contextItem.models[0];
          }
        }

        const model = (isComplexTtype(field.ttype!) ? field.references : field.model) || modelModel;

        return {
          name: fieldName,
          model,
          ttype: field.ttype,
          displayName: field.displayName
        } as IModelField;
      }
      return undefined as any as IModelField;
    }

    return {
      expressionItemList,
      operatorOptions,
      mode,
      seniorMode,
      visibleConfirm,
      optOptionLabelProp,
      expressionDisplayName,
      expressionApiName,
      modelFieldContextItems,
      isRsqlExp,
      createExpressionItemCompareOperatorOption,
      createExpressionItemLeftJoinField,
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
      onChangeField,
      changeVariableTypeHandle,
      isCanShowCompareValue,
      compareValueListBlurHandle,
      compareValueListChange,
      translateExpValue,
      changeHandler,
      onChangeSourceCode
    };
  }
});
</script>

<template>
  <a-popover
    overlay-class-name="expression-common-popover"
    :get-popup-container="getPopupContainer"
    placement="bottomLeft"
    :open="isShowDropdown"
  >
    <template #default>
      <a-select
        class="oio-select"
        popup-class-name="oio-select-dropdown"
        label-in-value
        mode="multiple"
        :placeholder="placeholder"
        :allow-clear="isAllowClear"
        :show-arrow="isShowDownArrow"
        :value="selectValue"
        :options="null"
        :notFoundContent="null"
        :open="isShowDropdown"
        @change="onSelectValueChange"
        @dropdown-visible-change="onDropdownVisibleChange"
      />
    </template>
    <template #content>
      <div ref="dropdownRef">
        <expression-designer-cascader
          :group-by-store="isRsqlField"
          :options="availableOptions"
          :load-data="fetchChildrenInner"
          :change-on-select="changeOnSelect"
          :search-key-words="searchKeywordsDebounce"
          @change="onChange"
        >
          <template #header>
            <div class="variable-input-form-field-dropdown-header">
              <oio-input
                class="selection-search-input"
                size="small"
                v-model:value="searchKeywords"
                allow-clear
                border="false"
                :placeholder="translateExpValue('输入名称搜索')"
              >
                <template #prefix>
                  <oio-icon icon="oinone-sousuo1" color="#9E9E9E" size="16"></oio-icon>
                </template>
              </oio-input>
            </div>
          </template>
        </expression-designer-cascader>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { CloseCircleFilled, DownOutlined } from '@ant-design/icons-vue';
import { ModelFieldType } from '@oinone/kunlun-meta';
import { CastHelper } from '@oinone/kunlun-shared';
import { OioIcon, OioInput } from '@oinone/kunlun-vue-ui-antd';
import { WritableComputedRef } from '@vue/reactivity';
import { debounce } from 'lodash-es';
import { computed, defineComponent, onBeforeUnmount, onMounted, type PropType, Ref, ref, watch } from 'vue';
import { queryExpModelFields } from '../../service/modelDefinitionService';
import {
  checkBlurFocus,
  contextItems2ModelSelection,
  convertModelFields2Options,
  createVariableContextItem,
  createVariableItemBySelectedOptions,
  fetchExpressionChildren,
  translateExpValue
} from '../../share';
import {
  ExpressionSeniorMode,
  type IExpSelectOption,
  type IFunFilterMethod,
  type IVariableContextItem,
  type IVariableItem,
  ModelOptionType,
  VARIABLE_SEPARATE,
  VariableItemType
} from '../../types';
import ExpressionDesignerCascader from '../cascader/Cascader.vue';
import ControlTag from '../control/control-tag/ControlTag.vue';

const SIZE_CLASS_CONFIG = { default: '', small: 'ant-select-sm', large: 'ant-select-lg' };

enum SizeEnum {
  DEFAULT = 'default',
  SMALL = 'small',
  LARGE = 'large'
}

/**
 * 适用于表单类变量控件
 */
export default defineComponent({
  components: {
    OioInput,
    OioIcon,
    ExpressionDesignerCascader,
    ControlTag,
    CloseCircleFilled,
    DownOutlined
  },

  props: {
    labelViewType: String as PropType<ExpressionSeniorMode>,
    contextItems: Array as PropType<IVariableContextItem[]>,
    useContextName: {
      type: Boolean,
      default: false
    },
    ttypes: Array as PropType<ModelFieldType[]>,
    // 最大可选层级
    maxDepth: {
      type: Number,
      default: 0
    },
    // 是否简单模式
    isSimpleMode: {
      type: Boolean,
      default: true
    },
    isRsqlField: {
      type: Boolean,
      default: false
    },
    // 当此项为 true 时，点选每级菜单选项值都会发生变化
    changeOnSelect: {
      type: Boolean,
      default: false
    },
    // 简单场景用这个字符串的就行了
    value: String,
    displayName: String,
    // 条件表达式用这个复杂的
    valueList: {
      type: Array as PropType<IVariableItem[]>,
      default: () => []
    },
    change: Function,
    placeholder: String,
    // 是否可选复杂字段
    isCanSelectComplexField: {
      type: Boolean,
      default: true
    },
    isCanSelectRelationField: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    // 是否只要存储类型字段
    isFieldStore: {
      type: Boolean,
      default: undefined
    },
    size: {
      type: String as PropType<SizeEnum>,
      default: SizeEnum.DEFAULT
    },
    filterMethod: Function as PropType<IFunFilterMethod>
  },
  emits: ['change', 'changeList', 'update:valueList'],
  setup(props, { emit }) {
    const isShowDropdown = ref(false);
    const isShowDownArrow = ref(true);
    const isAllowClear = computed(() => {
      return props.allowClear;
    });

    const $$selectValue: Ref<IExpSelectOption | null | undefined> = ref();
    const selectValue: WritableComputedRef<IExpSelectOption | null | undefined> = computed({
      get() {
        if (!$$selectValue.value || !$$selectValue.value.value) {
          return undefined;
        }
        return $$selectValue.value;
      },
      set(val) {
        $$selectValue.value = val;
      }
    });

    const searchKeywords = ref('');
    const searchKeywordsDebounce = ref('');

    const searchInputMirrorRef = ref(null);
    const searchInputRef = ref(null);
    const selectionSearchLeft = ref(10);
    const selectClass = computed(() => {
      const classList = {
        'ant-select-allow-clear': isAllowClear,
        'ant-select-show-arrow': isShowDownArrow,
        'ant-select-open': isShowDropdown,
        'ant-select-focus': true
      };
      if (SIZE_CLASS_CONFIG[props.size]) {
        classList[SIZE_CLASS_CONFIG[props.size]] = true;
      }
      return classList;
    });

    const placeholder = computed(() => {
      if (isValueEmpty.value) {
        return props.placeholder;
      }
      return null;
    });

    const isValueEmpty = computed(() => {
      return !(selectValue.value && selectValue.value.value);
    });

    const onSelectValueChange = (selectedValues: string[]) => {
      if (!selectedValues.length) {
        onClear();
      }
    };

    const onClear = () => {
      selectValue.value = null;
    };

    const onChange = (selectedValues: string[], selectedOptions: IExpSelectOption[]) => {
      if (!selectedValues || !selectedValues.length) {
        return;
      }
      const variableItem = createVariableItemBySelectedOptions(
        options.value,
        selectedValues,
        createVariableContextItem(selectedValues, props.contextItems!)
      );
      if (!variableItem) {
        return;
      }
      const labelList = [variableItem.displayName];
      if (variableItem.subTitle) {
        labelList.push(variableItem.subTitle);
      }
      selectValue.value = {
        ...variableItem,
        label: labelList.join(VARIABLE_SEPARATE)
      } as IExpSelectOption;
      isShowDropdown.value = false;

      props.change?.(selectValue.value);
      emit('change', selectValue.value);
      emit('changeList', [variableItem] as IVariableItem[]);
      emit('update:valueList', [variableItem] as IVariableItem[]);
    };

    const options = ref<IExpSelectOption[]>([]);

    async function fetchDataList() {
      if (!props.contextItems || !props.contextItems.length) {
        console.warn('contextItems is blank');
        return;
      }
      if (props.contextItems.length > 1 || props.useContextName) {
        options.value = contextItems2ModelSelection(props.contextItems, props);
      } else {
        // 单个可选变量
        const models = props.contextItems?.map((a) => a.models);
        if (!models?.length || props.contextItems[0].modelFields?.length) {
          options.value = contextItems2ModelSelection(props.contextItems, props);
          return;
        }
        const modelFields = await queryExpModelFields(props.contextItems[0].models && props.contextItems[0].models[0]);
        options.value = convertModelFields2Options(
          modelFields,
          props.ttypes,
          props.isFieldStore,
          props.isCanSelectComplexField,
          true,
          props.filterMethod
        );
      }
      fillSelectValue();
    }

    function fillSelectValue() {
      if (!selectValue.value) {
        return;
      }
      if (!selectValue.value.label && selectValue.value.value) {
        const selectedArr = (selectValue.value.value as string).split('.');
        const find = options.value.find((a) => a.value === selectedArr[0]);
        const labelArr = [] as string[];
        const apiNameArr = [] as string[];
        if (find) {
          labelArr.push(find.label);
          apiNameArr.push(find.name);
          if (selectedArr.length > 1) {
            if (find.children) {
              const childFind = find.children.find((a) => a.value === selectedArr[1]);
              if (childFind) {
                labelArr.push(childFind.label);
                apiNameArr.push(childFind.name);
              }
            } else {
              labelArr.push(selectedArr[1]);
              apiNameArr.push(selectedArr[1]);
            }
          }
        }
        const apiName = apiNameArr.join('.');
        selectValue.value.apiName = apiName;
        if (props.labelViewType === ExpressionSeniorMode.API_NAME) {
          selectValue.value.label = apiName;
        } else {
          selectValue.value.label = labelArr.join('.');
        }
      }
    }

    async function fetchChildrenInner(selectedOptions: IExpSelectOption[]) {
      await fetchExpressionChildren(selectedOptions, CastHelper.cast(options.value), props);
      // await fetchChildrenOld(selectedOptions.map(a => a.value as unknown as string), CastHelper.cast(options.value), props);
    }

    async function fetchChildrenOld(
      selectedValues: string[],
      options: IExpSelectOption[],
      props: { ttypes?: ModelFieldType[]; isFieldStore?: boolean; filterMethod?: IFunFilterMethod }
    ) {
      if (!selectedValues || !selectedValues.length) {
        return;
      }
      const first = options.find((a) => a.value === selectedValues[0]);
      if (first && (first.model || first.references)) {
        const isFirstModel = first.optionType === ModelOptionType.MODEL;
        if (!first.isChildrenLoaded && (first.model || first.references)) {
          let modelFields = await queryExpModelFields(isFirstModel ? first.model : first.references);
          if (!isFirstModel) {
            modelFields = modelFields.filter((a) => (first.referenceFields || []).includes(a.name));
          }
          first.children = convertModelFields2Options(
            modelFields,
            props.ttypes,
            props.isFieldStore,
            isFirstModel,
            false,
            props.filterMethod
          );
          first.isChildrenLoaded = true;
        }
        if (first.children && selectedValues.length > 1) {
          const second = first.children?.find((a) => a.value === selectedValues[1]);
          if (second && !second.isChildrenLoaded) {
            let modelFields = await queryExpModelFields(second.references);
            modelFields = modelFields.filter((a) => (second.referenceFields || []).includes(a.name));
            second.children = convertModelFields2Options(
              modelFields,
              props.ttypes,
              props.isFieldStore,
              false,
              false,
              props.filterMethod
            );
            second.isChildrenLoaded = true;
          }
        }
      }
    }

    const availableOptions = computed(() => {
      const opts = options.value;
      if (props.isRsqlField) {
        opts.sort((a, b) => {
          if (a.store && !b.store) {
            return -1;
          }
          if (!a.store && b.store) {
            return 1;
          }
          return 0;
        });
      }
      return opts;
    });

    const getPopupContainer = (triggerNode?: HTMLElement) => {
      return document.body;
    };
    watch(
      () => props.value,
      (val) => {
        if (!props.isSimpleMode) {
          return;
        }
        if (val) {
          selectValue.value = {
            value: props.value as string,
            label: props.displayName,
            apiName: ''
          } as IExpSelectOption;
          fillSelectValue();
        }
      },
      { immediate: true }
    );
    watch(
      () => props.valueList,
      (newVal) => {
        if (props.isSimpleMode) {
          return;
        }
        const fieldVar =
          newVal.find((a) => a.type === VariableItemType.FIELD) ||
          newVal.find((a) => a.type === VariableItemType.VARIABLE) ||
          newVal.find((a) => a.type === VariableItemType.OPTION);
        if (fieldVar) {
          const labelList = [fieldVar.displayName];
          if (fieldVar.subTitle) {
            labelList.push(fieldVar.subTitle);
          }
          selectValue.value = {
            value: fieldVar.value,
            label: labelList.join(VARIABLE_SEPARATE),
            apiName: fieldVar.apiName,
            displayName: fieldVar.displayName,
            subTitle: fieldVar.subTitle
          } as IExpSelectOption;
        } else {
          selectValue.value = {} as IExpSelectOption;
        }
      },
      { immediate: true }
    );
    watch(
      () => props.contextItems,
      () => {
        fetchDataList();
      },
      { immediate: true, deep: true }
    );

    const controlRef = ref<HTMLElement>(null as any);
    const dropdownRef = ref<HTMLElement>(null as any);

    const onDropdownVisibleChange = (visible: boolean) => {
      isShowDropdown.value = visible;
    };

    const changeSearchKey = debounce((newValue) => {
      searchKeywordsDebounce.value = newValue;
    }, 300);

    watch(searchKeywords, (newValue) => {
      changeSearchKey(newValue);
    });

    let isFocus = false;
    const onContains = (e) => {
      checkBlurFocus(
        isFocus,
        e.target as HTMLElement,
        controlRef.value,
        dropdownRef.value,
        () => {
          isFocus = false;
          isShowDropdown.value = false;
        },
        () => {
          isFocus = true;
        }
      );
    };

    onMounted(() => {
      document.body.addEventListener('click', onContains);
    });
    onBeforeUnmount(() => {
      document.body.removeEventListener('click', onContains);
      isShowDropdown.value = false;
    });

    return {
      placeholder,
      onDropdownVisibleChange,
      onSelectValueChange,

      selectClass,
      isShowDropdown,
      isShowDownArrow,
      isValueEmpty,
      isAllowClear,
      selectValue,
      searchKeywords,
      searchKeywordsDebounce,
      selectionSearchLeft,
      searchInputMirrorRef,
      searchInputRef,
      controlRef,
      dropdownRef,
      options,
      availableOptions,
      getPopupContainer,
      onClear,
      onChange,
      fetchChildrenInner,
      translateExpValue
    };
  }
});
</script>
<style lang="scss">
.model-field-select-control {
  &.ant-select {
    &:not(.ant-select-customize-input) .ant-select-selector {
      border-radius: 4px;
    }

    &:not(.ant-select-disabled):hover .ant-select-selector {
      border-color: var(--oio-primary-color);
    }
  }
}
</style>

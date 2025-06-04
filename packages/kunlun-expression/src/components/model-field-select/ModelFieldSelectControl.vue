<template>
  <a-popover
    overlay-class-name="expression-common-popover"
    :get-popup-container="getPopupContainer"
    placement="bottomLeft"
    :visible="isShowDropdown"
  >
    <template #default>
      <span
        class="ant-select ant-select-single oio-select model-field-select-control"
        :class="selectClass"
        ref="controlRef"
      >
        <div class="ant-select-selector" @click="toggleDropdown">
          <span
            class="ant-select-selection-item ant-select-selection-item-tag"
            v-if="!isValueEmpty"
            :title="selectValue.label"
          >
            <control-tag
              :title="labelViewType === 'API_NAME' ? selectValue.apiName : selectValue.label"
              :closable="false"
              @close="onClear"
            />
          </span>
          <span class="ant-select-selection-placeholder" v-if="isShowPlaceholder" @click="toggleDropdown">{{
            placeholder
          }}</span>
        </div>
        <span class="ant-select-arrow" v-if="isShowDownArrow">
          <down-outlined class="ant-select-suffix" />
        </span>
        <span class="ant-select-clear" v-if="isAllowClear" @click="onClear">
          <close-circle-filled />
        </span>
      </span>
    </template>
    <template #content>
      <div ref="dropdownRef">
        <expression-designer-cascader
          :group-by-store="isRsqlField"
          :options="availableOptions"
          :load-data="fetchChildrenInner"
          :change-on-select="changeOnSelect"
          @change="onChange"
        >
          <template #header>
            <div class="variable-input-form-field-dropdown-header">
              <oio-input
                class="selection-search-input"
                size="small"
                v-model:value="searchKeywords"
                allow-clear
                :placeholder="translateExpValue('输入名称搜索')"
              />
            </div>
          </template>
        </expression-designer-cascader>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue';
import { OioInput } from '@oinone/kunlun-vue-ui-antd';
import { CloseCircleFilled, DownOutlined } from '@ant-design/icons-vue';
import { ModelFieldType } from '@oinone/kunlun-meta';
import { CastHelper } from '@oinone/kunlun-shared';
import ControlTag from '../control/control-tag/ControlTag.vue';
import ExpressionDesignerCascader from '../cascader/Cascader.vue';
import {
  ExpressionSeniorMode,
  IExpSelectOption,
  IFunFilterMethod,
  IVariableContextItem,
  IVariableItem,
  ModelOptionType,
  VARIABLE_SEPARATE,
  VariableItemType
} from '../../types';
import {
  checkBlurFocus,
  contextItems2ModelSelection,
  convertModelFields2Options,
  createVariableContextItem,
  createVariableItemBySelectedOptions,
  fetchExpressionChildren,
  translateExpValue
} from '../../share';
import { queryExpModelFields } from '../../service/modelDefinitionService';

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
      return props.allowClear && !isValueEmpty.value;
    });
    const selectValue = ref<IExpSelectOption>({} as IExpSelectOption);
    const searchKeywords = ref('');
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

    const isShowPlaceholder = computed(() => {
      return isValueEmpty.value;
    });
    const isValueEmpty = computed(() => {
      return !(selectValue.value && selectValue.value.value);
    });
    const onClear = () => {
      selectValue.value = {} as IExpSelectOption;
    };

    const onChange = (selectedValues: string[], selectedOptions: IExpSelectOption[]) => {
      // console.log('onChange', selectedValues, selectedOptions);
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
      // variableItem.type = VariableItemType.FIELD;
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
      if (!selectValue.value.label && selectValue.value.value) {
        const selectedArr = (selectValue.value.value as string).split('.');
        const find = options.value.find((a) => a.value === selectedArr[0]);
        const labelArr = [] as string[];
        const apiNameArr = [] as string[];
        // console.log('fillSelectValue', selectValue, selectedArr);
        // FIXME 动态
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
        selectValue.value.label = labelArr.join('.');
        selectValue.value.apiName = apiNameArr.join('.');
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
      const opts = searchKeywords.value
        ? options.value.filter((a) => a.displayName!.includes(searchKeywords.value))
        : options.value;
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

    const toggleDropdown = () => {
      isShowDropdown.value = !isShowDropdown.value;
    };

    const getPopupContainer = (triggerNode?: HTMLElement) => {
      return document.body;
    };
    watch(
      () => props.value,
      () => {
        if (!props.isSimpleMode) {
          return;
        }
        selectValue.value = { value: props.value as string, label: props.displayName, apiName: '' } as IExpSelectOption;
        fillSelectValue();
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

    watch(isShowDropdown, () => {
      if (isShowDropdown.value) {
        nextTick(() => {
          // autoSetPopoverCss(controlRef.value, dropdownRef.value, true);
        });
      }
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
      selectClass,
      isShowDropdown,
      isShowDownArrow,
      isValueEmpty,
      isAllowClear,
      selectValue,
      searchKeywords,
      selectionSearchLeft,
      searchInputMirrorRef,
      searchInputRef,
      isShowPlaceholder,
      controlRef,
      dropdownRef,
      options,
      availableOptions,
      getPopupContainer,
      toggleDropdown,
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

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
        <expression-designer-cascader :options="options" @change="onChange"></expression-designer-cascader>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { deepClone } from '@oinone/kunlun-meta';
import { WritableComputedRef } from '@vue/reactivity';
import { Popover as APopover, Select as ASelect } from 'ant-design-vue';
import { computed, defineComponent, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import { queryExpBuildInFunction } from '../../../service';
import { checkBlurFocus, createDefaultVariableItemList, translateExpValue } from '../../../share';
import { FunctionCategoryList, type IExpSelectOption } from '../../../types';
import ExpressionDesignerCascader from '../../cascader/Cascader.vue';

/**
 * 适用于表单类变量控件
 */
export default defineComponent({
  components: {
    ASelect,
    APopover,
    ExpressionDesignerCascader
  },
  props: {
    value: String,
    placeholder: {
      type: String,
      default: () => translateExpValue('请选择函数')
    },
    change: Function,
    // label里面显示的还是value的值
    showValueLabel: Boolean,
    allowClear: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change-fun', 'update:value'],
  setup(props, context) {
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
    const searchInputMirrorRef = ref(null);
    const searchInputRef = ref(null);
    const selectionSearchLeft = ref(10);
    const options = ref<IExpSelectOption[]>([]);

    const placeholder = computed(() => {
      if (isValueEmpty.value) {
        return props.placeholder;
      }
      return null;
    });

    const isValueEmpty = computed(() => {
      return !(selectValue.value && selectValue.value.value);
    });

    const emitChangeEvent = () => {
      context.emit('update:value', selectValue.value?.value);
      context.emit('change-fun', selectValue.value);
      props.change && props.change(selectValue.value);
    };

    const onSelectValueChange = (selectedValues: string[]) => {
      if (!selectedValues.length) {
        onClear();
      }
    };

    const onClear = () => {
      selectValue.value = null;
      emitChangeEvent();
    };

    const onChange = (selectedValues: string[]) => {
      if (!selectedValues || !selectedValues.length) {
        return;
      }
      const firstValue = options.value.find((a) => a.value === selectedValues[0]);
      if (!firstValue) {
        return;
      }
      if (selectedValues.length > 1 && firstValue.children) {
        const secondValue = firstValue.children.find((a) => a.value === selectedValues[1]);
        if (secondValue) {
          selectValue.value = JSON.parse(JSON.stringify(secondValue));
        }
      }
      isShowDropdown.value = false;

      emitChangeEvent();
    };

    const setSelectedValue = (newVal) => {
      let functions: IExpSelectOption[] = [];
      options.value &&
        options.value.forEach((a) => {
          if (a.children) functions = [...functions, ...a.children];
        });
      const selectItem = functions.find((a) => a.value === props.value);

      selectValue.value = selectItem
        ? selectItem
        : ({ value: props.value as string, label: selectValue.value?.label || props.value } as IExpSelectOption);
    };

    const getPopupContainer = (triggerNode) => {
      return document.body;
    };

    watch(
      () => props.value,
      (newVal) => {
        setSelectedValue(newVal);
      },
      { immediate: true }
    );

    const controlRef = ref<HTMLElement>(null as any);
    const dropdownRef = ref<HTMLElement>(null as any);

    const onDropdownVisibleChange = (visible: boolean) => {
      isShowDropdown.value = visible;
    };

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

    onMounted(async () => {
      const functionList = await queryExpBuildInFunction();
      options.value = FunctionCategoryList.map((cate) => {
        cate.label = translateExpValue(cate.label);
        cate.children = functionList
          .filter((a) => a.category == cate.value)
          .map((fun) => {
            fun = deepClone(fun);
            if (fun.argumentList) {
              fun.argumentList.forEach((arg) => {
                arg.param = '';
                if (!arg.variableItemList || !arg.variableItemList.length) {
                  arg.variableItemList = createDefaultVariableItemList();
                }
              });
            }
            return { ...fun, label: fun.displayName, value: fun.fun };
          });
        return cate;
      }).filter((a) => a.children && a.children.length > 0);

      setSelectedValue(selectValue.value?.value);
    });

    return {
      placeholder,
      onDropdownVisibleChange,
      onSelectValueChange,

      options,
      isShowDropdown,
      isShowDownArrow,
      isValueEmpty,
      isAllowClear,
      selectValue,
      searchKeywords,
      selectionSearchLeft,
      searchInputMirrorRef,
      searchInputRef,
      controlRef,
      dropdownRef,
      getPopupContainer,
      onClear,
      onChange
    };
  }
});
</script>

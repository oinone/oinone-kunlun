<template>
  <a-popover
    overlay-class-name="expression-common-popover"
    :get-popup-container="getPopupContainer"
    placement="bottomLeft"
    :visible="isShowDropdown"
  >
    <template #default>
      <span
        class="ant-select ant-select-single build-in-function-select-control"
        :class="{
      'ant-select-allow-clear': isAllowClear,
      'ant-select-show-arrow': isShowDownArrow,
      'ant-select-open': isShowDropdown,
      'ant-select-focus': true,
    }"
        ref="controlRef"
      >
        <div class="ant-select-selector" @click="toggleDropdown">
          <span class="ant-select-selection-item" v-if="!isValueEmpty" :title="selectValue.label">
            {{ showValueLabel ? selectValue.value : selectValue.label }}
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
        <expression-designer-cascader :options="options" @change="onChange">
        </expression-designer-cascader>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { Select as ASelect } from 'ant-design-vue';
import { CloseCircleOutlined, CloseCircleFilled, DownOutlined } from '@ant-design/icons-vue';
import { checkBlurFocus, createDefaultVariableItemList, translateExpValue } from '../../../share';
import { FunctionCategoryList, IExpSelectOption } from '../../../types';
import ExpressionDesignerCascader from '../../cascader/Cascader.vue';
import { queryExpBuildInFunction } from '../../../service';
import { deepClone } from '@kunlun/meta';

/**
 * 适用于表单类变量控件
 */
export default defineComponent({
  components: {
    ASelect,
    ExpressionDesignerCascader,
    CloseCircleOutlined,
    CloseCircleFilled,
    DownOutlined,
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
      default: true,
    },
  },
  emits: ['change-fun', 'update:value'],
  setup(props, context) {
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
    const options = ref<IExpSelectOption[]>([]);

    const isShowPlaceholder = computed(() => {
      return isValueEmpty.value && !searchKeywords.value;
    });
    const isValueEmpty = computed(() => {
      return !(selectValue.value && selectValue.value.value);
    });
    const emitChangeEvent = () => {
      context.emit('update:value', selectValue.value.value);
      context.emit('change-fun', selectValue.value);
      props.change && props.change(selectValue.value);
    };
    const onClear = () => {
      selectValue.value = {} as IExpSelectOption;
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

    const toggleDropdown = () => {
      isShowDropdown.value = !isShowDropdown.value;
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
        : ({ value: props.value as string, label: selectValue.value.label || props.value } as IExpSelectOption);
    };

    const getPopupContainer = (triggerNode) => {
      return document.body;
    }

    watch(
      () => props.value,
      (newVal) => {
        setSelectedValue(newVal);
      },
      { immediate: true },
    );

    const controlRef = ref<HTMLElement>(null as any);
    const dropdownRef = ref<HTMLElement>(null as any);

    watch(isShowDropdown, () => {
      if (isShowDropdown.value) {
        nextTick(() => {
          // autoSetPopoverCss(controlRef.value, dropdownRef.value);
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

      setSelectedValue(selectValue.value.value);
    });

    return {
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
      isShowPlaceholder,
      controlRef,
      dropdownRef,
      getPopupContainer,
      toggleDropdown,
      onClear,
      onChange
    };
  }
});
</script>

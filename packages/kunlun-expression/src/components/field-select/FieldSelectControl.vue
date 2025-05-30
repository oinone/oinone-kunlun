<template>
  <a-popover
    overlay-class-name="expression-common-popover"
    :get-popup-container="getPopupContainer"
    placement="bottomLeft"
    :visible="isShowDropdown"
  >
    <template #default>
      <span
        class="ant-select ant-select-single field-select-control"
        :class="{
      'ant-select-allow-clear': isAllowClear,
      'ant-select-show-arrow': isShowDownArrow,
      'ant-select-open': isShowDropdown,
      'ant-select-focus': true,
    }"
        ref="controlRef"
      >
        <div class="ant-select-selector" @click="toggleDropdown">
          <span class="ant-select-selection-search">
            <input
              autocomplete="off"
              class="ant-select-selection-search-input"
              type="search"
              style="opacity: 1"
              ref="searchInputRef"
              v-model="searchKeywords"
              @change="onSearchKeywordsChange"
            />
          </span>
          <span
            class="ant-select-selection-item ant-select-selection-item-tag"
            v-if="!isValueEmpty"
            :title="selectValue.label"
          >
            <control-tag :title="selectValue.displayName" :desc="selectValue.subTitle" closable @close="onClear" />
          </span>
          <span class="ant-select-selection-placeholder" v-if="isShowPlaceholder" @click="toggleDropdown">{{
              placeholder
            }}</span>
        </div>
        <span class="ant-select-arrow" v-if="isShowDownArrow">
          <down-outlined class="ant-select-suffix" />
        </span>
            <!--    <span class="ant-select-clear" v-if="isAllowClear" @click="onClear">-->
            <!--      <close-circle-filled />-->
            <!--    </span>-->
      </span>
    </template>
    <template #content>
      <div ref="dropdownRef">
        <expression-designer-cascader
          :options="options"
          :load-data="fetchChildren"
          @change="onChange"
        >
        </expression-designer-cascader>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Select as ASelect } from 'ant-design-vue';
import { CloseCircleFilled, CloseCircleOutlined, DownOutlined } from '@ant-design/icons-vue';
import ModelSelection from '../ModelSelection.vue';
import ControlTag from '../control/control-tag/ControlTag.vue';
import ExpressionDesignerCascader from '../cascader/Cascader.vue';
import { IExpSelectOption } from '../../types';
import { checkBlurFocus } from '../../share/utils';

/**
 * 适用于表单类变量控件
 */
export default defineComponent({
  components: {
    ASelect,
    ExpressionDesignerCascader,
    ControlTag,
    ModelSelection,
    CloseCircleOutlined,
    CloseCircleFilled,
    DownOutlined,
  },

  props: [
    'value',
    'change',
    'fetchChildren',
    'placeholder',
    'dataList',
    'options',
    'pagination',
    'onPaginationChange',
    'onKeywordChange',
  ],
  setup(props, context) {
    const isShowDropdown = ref(false);
    const isShowDownArrow = ref(true);
    const isAllowClear = computed(() => {
      return !isValueEmpty.value;
    });
    const selectValue = ref<IExpSelectOption>({} as IExpSelectOption);
    const searchKeywords = ref('');
    const searchInputMirrorRef = ref(null);
    const searchInputRef = ref(null);
    const selectionSearchLeft = ref(10);

    const isShowPlaceholder = computed(() => {
      return isValueEmpty.value && !searchKeywords.value;
    });
    const isValueEmpty = computed(() => {
      return !(selectValue.value && selectValue.value.value);
    });
    const onSearchKeywordsChange = (e) => {
      props.onKeywordChange(searchKeywords.value);
    };
    const onClear = () => {
      selectValue.value = {} as IExpSelectOption;
    };

    const onChange = (selectedValues: string[]) => {
      if (!selectedValues || !selectedValues.length) {
        return;
      }
      const firstValue = props.options.find((a) => a.value === selectedValues[0]);
      const selectOption: IExpSelectOption = {
        ...firstValue,
      } as IExpSelectOption;
      if (!firstValue) {
        return;
      }
      if (selectedValues.length > 1) {
        const secondValue = firstValue.children.find((a) => a.value === selectedValues[1]);
        if (secondValue) {
          selectOption.subTitle = secondValue.displayName;
          selectOption.label += ',' + secondValue.displayName;
          if (selectedValues.length > 2) {
            const thirdValue = secondValue.children.find((a) => a.value === selectedValues[2]);
            if (thirdValue) {
              selectOption.subTitle += ',' + thirdValue.displayName;
              selectOption.label += ',' + thirdValue.displayName;
            }
          }
        }
      }
      selectValue.value = selectOption;
      isShowDropdown.value = false;
      searchKeywords.value = '';

      props.change(selectValue.value);
    };

    const toggleDropdown = () => {
      isShowDropdown.value = !isShowDropdown.value;
    };

    watch(searchKeywords, (newVal) => {
      if (searchKeywords.value) {
        isShowDropdown.value = true;
        props.onKeywordChange(searchKeywords.value);
      } else {
        isShowDropdown.value = false;
      }
    });
    watch(
      () => props.value,
      (newVal) => {
        selectValue.value = { value: props.value as string, label: '' } as IExpSelectOption;
      },
      { immediate: true },
    );

    const controlRef = ref<HTMLElement>(null as any);
    const dropdownRef = ref<HTMLElement>(null as any);

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

    const getPopupContainer = (triggerNode) => {
      return document.body;
    }
    return {
      getPopupContainer,
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
      toggleDropdown,
      onSearchKeywordsChange,
      onClear,
      onChange,
    };
  },
});
</script>

<template>
  <div class="form-multi-select" :class="[!allowClear && 'hide-clear']">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <a-select
        mode="multiple"
        label-in-value
        :max-tag-count="maxTagCount"
        :placeholder="placeholder"
        :value="currentValue"
        :options="optionList"
      />
    </div>
    <div v-else>
      <a-select
        ref="selectRef"
        mode="multiple"
        class="oio-select"
        label-in-value
        :show-search="selectShowSearch"
        :max-tag-count="maxTagCount"
        :allow-clear="allowClear"
        :disabled="innerDisabled"
        :value="currentValue === null ? undefined : currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :placeholder="placeholder"
        :open="dropdownOpen"
        :get-popup-container="getTriggerContainer"
        :dropdownClassName="dropdownClassName"
        @change="innerChange"
        @search="search"
        @focus="onFocus"
        @blur="onBlur"
        @popupScroll="slipSelect"
        @dropdownVisibleChange="dropdownVisibleChange"
        @keydown="onKeydown"
      >
        <template #dropdownRender="{ menuNode: menu }">
          <oio-input
            v-if="inputShowSearch"
            ref="dropdownInputRef"
            :placeholder="placeholder"
            :value="searchValue"
            @update:value="search"
            @focus="onFocusInputSearch"
            @blur="onBlurInputSearch"
          >
            <template #prefix>
              <oio-icon icon="oinone-sousuo2" size="16" />
            </template>
          </oio-input>
          <v-nodes :vnodes="menu" />
          <div class="form-relation-select-dropdown-spin">
            <oio-spin v-if="loadMoreLoading" size="small" loading />
          </div>
        </template>
        <template #notFoundContent>
          <oio-empty-data v-if="!loadMoreLoading" />
        </template>
      </a-select>
    </div>
  </div>
</template>
<script lang="ts">
import { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { OioEmptyData, OioIcon, OioInput, OioSpin } from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import { defineComponent, PropType, ref, watch } from 'vue';
import { useInjectOioDefaultFormContext } from '../../../../basic';
import { RelationSelectProps, relationSelectSetup } from '../../../prop';

export default defineComponent({
  props: {
    ...RelationSelectProps,
    value: {
      type: Array as PropType<Record<string, unknown>[]>
    },
    generatorSelectOption: {
      type: Function
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
  },
  components: {
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
    OioSpin,
    OioEmptyData,
    ASelect,
    OioInput,
    OioIcon
  },
  setup(props) {
    const optionList = ref<Record<string, unknown>[]>([]);
    const getOptionList = (options: Record<string, unknown>[]) => {
      optionList.value = [...options];
    };

    watch(
      () => props.options,
      () => {
        if (props.options && props.options.length) {
          getOptionList(props.options);
        } else {
          optionList.value = [];
        }
      },
      { immediate: true }
    );

    watch(
      () => props.value,
      () => {
        if (!props.isInitOptions && props.value) {
          getOptionList(props.generatorSelectOption?.(props.value) || []);
        }
      },
      { immediate: true }
    );

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...relationSelectSetup(props, true),
      optionList,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>

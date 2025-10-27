<template>
  <div class="form-single-select">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <a-select
        class="oio-select"
        dropdown-class-name="oio-select-dropdown"
        label-in-value
        :placeholder="placeholder"
        :value="currentValue"
        :options="optionList"
      />
    </div>
    <div v-else>
      <a-select
        class="oio-select"
        label-in-value
        :show-search="selectShowSearch"
        :allow-clear="allowClear"
        :disabled="innerDisabled"
        :value="currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :placeholder="placeholder"
        :open="dropdownOpen"
        :getPopupContainer="getTriggerContainer"
        :dropdownClassName="dropdownClassName"
        @change="change"
        @search="search"
        @select="innerSelect"
        @blur="blur"
        @focus="focus"
        @dropdownVisibleChange="dropdownVisibleChange"
        @popup-scroll="slipSelect"
        @keydown="onKeydown"
      >
        <template #dropdownRender="{ menuNode: menu }">
          <oio-input
            v-if="inputShowSearch"
            ref="dropdownInputRef"
            :placeholder="placeholder"
            :value="searchValue"
            @update:value="search"
          >
            <template #prefix>
              <oio-icon icon="oinone-sousuo2" size="16"></oio-icon>
            </template>
          </oio-input>
          <v-nodes :vnodes="menu" />
          <div class="form-relation-select-dropdown-spin">
            <oio-spin v-if="loadMoreLoading" size="small" loading />
          </div>
        </template>
        <template #menuItemSelectedIcon>
          <check-outlined />
        </template>
        <template #notFoundContent>
          <oio-empty-data v-if="!loadMoreLoading" />
        </template>
      </a-select>
    </div>
  </div>
</template>
<script lang="ts">
import { CheckOutlined } from '@ant-design/icons-vue';
import { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { OioEmptyData, OioIcon, OioInput, OioSpin } from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { useInjectOioDefaultFormContext } from '../../../../basic';
import { RelationSelectProps, relationSelectSetup } from '../../../prop';

export default defineComponent({
  inheritAttrs: false,
  components: {
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
    CheckOutlined,
    OioEmptyData,
    OioSpin,
    ASelect,
    OioInput,
    OioIcon
  },
  props: {
    ...RelationSelectProps,
    value: Object,
    currentValueLabel: String,
    handleSelectedValueLabel: Function,
    generatorSelectOption: {
      type: Function
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
  },
  setup(props) {
    const optionList = ref<Record<string, unknown>[]>([]);
    const getOptionList = (options: Record<string, unknown>[]) => {
      optionList.value = [...options];
    };

    const currentValue = computed(() => {
      if (props.value && props.value[props.relationFieldKey]) {
        return { value: props.value[props.relationFieldKey] };
      }
      return null;
    });

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
          getOptionList(props.generatorSelectOption?.([props.value]) || []);
        }
      },
      { immediate: true }
    );

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...relationSelectSetup(props),
      currentValue,
      optionList,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>

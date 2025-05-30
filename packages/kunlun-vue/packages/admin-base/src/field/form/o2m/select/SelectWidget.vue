<template>
  <div class="form-multi-select" :class="[!allowClear && 'hide-clear']">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <a-select
        :max-tag-count="maxTagCount"
        label-in-value
        mode="multiple"
        :placeholder="placeholder"
        :value="currentValue"
        :options="optionList"
      />
    </div>
    <div v-else>
      <a-select
        ref="selectRef"
        mode="multiple"
        label-in-value
        class="oio-select"
        optionFilterProp="label"
        :max-tag-count="maxTagCount"
        :show-search="showSearch"
        :allow-clear="allowClear"
        :disabled="innerDisabled"
        :value="currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :placeholder="placeholder"
        :getPopupContainer="getTriggerContainer"
        :dropdownClassName="dropdownClassName"
        @change="innerChange"
        @search="search"
        @blur="blur"
        @focus="focus"
        @popupScroll="slipSelect"
        @dropdownVisibleChange="dropdownVisibleChange"
      >
        <template #dropdownRender="{ menuNode: menu }">
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
import { defineComponent, PropType, ref, watch } from 'vue';
import { OioSpin, OioEmptyData } from '@kunlun/vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import { relationSelectSetup, RelationSelectProps } from '../../../prop';
import { useInjectOioDefaultFormContext } from '../../../../basic';

export default defineComponent({
  props: {
    ...RelationSelectProps,
    value: {
      type: Array as PropType<Record<string, unknown>[]>
    },
    generatorSelectOption: Function
  },
  components: {
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
    OioSpin,
    OioEmptyData,
    ASelect
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
      ...relationSelectSetup(props),
      optionList,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>

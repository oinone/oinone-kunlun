<template>
  <div class="form-multi-select" :class="[!allowClear && 'hide-clear']">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <a-select
        :max-tag-count="maxTagCount"
        label-in-value
        mode="multiple"
        :value="currentValue"
        :options="optionList"
      />
    </div>
    <div v-else>
      <a-select
        ref="selectRef"
        mode="multiple"
        class="oio-select"
        show-search
        label-in-value
        :max-tag-count="maxTagCount"
        :allowClear="allowClear"
        :disabled="innerDisabled"
        :value="currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :placeholder="innerReadonly || innerDisabled ? '' : placeholder"
        :get-popup-container="getTriggerContainer"
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
import { OioSpin, OioEmptyData } from '@kunlun/vue-ui-antd';
import { defineComponent, PropType, ref, watch } from 'vue';
import { Select as ASelect } from 'ant-design-vue';
import { useInjectOioDefaultFormContext } from '../../../basic';
import { RelationSelectProps, relationSelectSetup } from '../../../field';

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

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...relationSelectSetup(props),
      optionList,
      getTriggerContainer: formContext.getTriggerContainer
    };
  }
});
</script>

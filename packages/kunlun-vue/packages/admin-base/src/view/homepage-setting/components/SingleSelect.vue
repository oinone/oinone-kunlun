<template>
  <div class="form-single-select">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <a-select
        class="oio-select"
        dropdown-class-name="oio-select-dropdown"
        label-in-value
        :getPopupContainer="getTriggerContainer"
        :value="currentValue"
        :options="optionList"
      />
    </div>

    <div v-else>
      <a-select
        class="oio-select"
        label-in-value
        :show-search="showSearch"
        :allow-clear="allowClear"
        :disabled="innerDisabled"
        :value="currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :placeholder="innerReadonly || innerDisabled ? '' : placeholder"
        :getPopupContainer="getTriggerContainer"
        :dropdownClassName="dropdownClassName"
        @change="change"
        @search="search"
        @select="innerSelect"
        @blur="blur"
        @dropdownVisibleChange="dropdownVisibleChange"
        @focus="focus"
        @popup-scroll="slipSelect"
      >
        <template #dropdownRender="{ menuNode: menu }">
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
import { OioSpin, OioEmptyData } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, ref, watch } from 'vue';
import { Select as ASelect } from 'ant-design-vue';
import { useInjectOioDefaultFormContext } from '../../../basic';
import { RelationSelectProps, relationSelectSetup } from '../../../field';

export default defineComponent({
  inheritAttrs: false,
  props: {
    ...RelationSelectProps,
    value: Object,
    currentValueLabel: String,
    handleSelectedValueLabel: Function,
    generatorSelectOption: Function
  },
  components: {
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
    CheckOutlined,
    OioEmptyData,
    OioSpin,
    ASelect
  },
  setup(props) {
    const optionList = ref<Record<string, unknown>[]>([]);
    const getOptionList = (options: Record<string, unknown>[]) => {
      optionList.value = [...options];
    };

    const currentValue = computed(() => {
      if (props.value && props.value[props.relationFieldKey]) {
        return props.value[props.relationFieldKey];
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

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...relationSelectSetup(props),
      currentValue,
      optionList,
      getTriggerContainer: formContext.getTriggerContainer
    };
  }
});
</script>

<template>
  <div class="form-single-select">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <a-select
        class="oio-select"
        dropdown-class-name="oio-select-dropdown"
        label-in-value
        :placeholder="placeholder"
        :getPopupContainer="getTriggerContainer"
        :value="currentValue"
        :options="optionList"
      />
    </div>

    <div v-else>
      <a-select
        class="oio-select"
        :show-search="showSearch"
        :allow-clear="allowClear"
        :disabled="innerDisabled"
        :value="currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :placeholder="placeholder"
        :getPopupContainer="getTriggerContainer"
        :dropdownClassName="dropdownClassName"
        @change="onChange"
        @search="search"
        @select="innerSelect"
        @blur="blur"
        @dropdownVisibleChange="dropdownVisibleChange"
        @focus="focus"
        @popup-scroll="slipSelect"
      >
        <a-select-option v-for="opt in optionList" :value="opt.value">
          <div class="lang-badge-selection-opt">
            <oio-icon :icon="opt.icon" size="16"></oio-icon>
            {{ opt.label }}
          </div>
        </a-select-option>
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
import { OioSpin, OioEmptyData, OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, ref, watch } from 'vue';
import { Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { useInjectOioDefaultFormContext } from '../../../basic';
import { RelationSelectProps, relationSelectSetup } from '../../prop';

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
    CheckOutlined,
    OioEmptyData,
    OioSpin,
    ASelect,
    ASelectOption,
    OioIcon
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

    watch(
      () => props.value,
      () => {
        if (!props.isInitOptions && props.value) {
          getOptionList(props.generatorSelectOption?.([props.value]) || []);
        }
      },
      { immediate: true }
    );

    const onChange = (value) => {
      props.change({ value });
    };

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...relationSelectSetup(props),
      currentValue,
      optionList,
      onChange,
      getTriggerContainer: formContext.getTriggerContainer
    };
  }
});
</script>
<style lang="scss">
.form-single-select {
  .lang-badge-selection-opt {
    display: flex;
    align-items: center;
    .oio-icon {
      margin-right: 5px;
    }
  }
}
</style>

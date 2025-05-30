<template>
  <div class="form-single-select">
    <div class="readonly" v-if="readonly && !disabled">
      <oio-select
        :value="realValue"
        :options="realOptions"
        :properties="properties"
        :placeholder="placeholder"
        :get-trigger-container="getTriggerContainer"
      />
    </div>
    <oio-select
      v-else
      dropdownClassName="oio-ant-select-dropdown-global"
      :value="realValue"
      :options="realOptions"
      :properties="properties"
      :get-trigger-container="getTriggerContainer"
      :allowClear="allowClear"
      :filter-option="false"
      :not-found-content="null"
      :default-active-first-option="false"
      :disabled="disabled"
      :placeholder="placeholder"
      @change="selectChange"
      @blur="blur"
      @focus="focus"
    />
  </div>
</template>
<script lang="ts">
import { RuntimeEnumerationOption } from '@kunlun/engine';
import { defaultSelectProperties, OioSelect, SelectItem } from '@kunlun/vue-ui-antd';
import { computed, defineComponent, PropType } from 'vue';
import {
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext,
  useMetadataProps
} from '../../../../../basic';
import { optionsConvertSelectItem } from '../../../../util';

export default defineComponent({
  components: {
    OioSelect
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Boolean, Object],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean, Object],
      default: undefined
    },
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>
    },
    allowClear: {
      type: Boolean
    },
    placeholder: {
      type: String
    }
  },
  setup(props) {
    const { realValue, readonly, disabled, placeholder } = useMetadataProps(props);

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() =>
      optionsConvertSelectItem(props.options).map((opt) => {
        return {
          ...opt,
          disabled: opt.disabled ? realValue.value !== opt.value : false
        };
      })
    );

    const formContext = useInjectOioDefaultFormContext();

    const selectChange = (val: SelectItem) => {
      if (props.change) {
        props.change(val ? val.key : null);
      }
      props.blur && props.blur();
    };
    return {
      placeholder,
      properties: defaultSelectProperties,
      realValue,
      readonly,
      disabled,
      realOptions,
      selectChange,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>

<template>
  <div class="form-enum-radio">
    <div class="not-readonly" v-if="!readonly || (readonly && disabled)">
      <a-radio-group :value="selectedValue" :disabled="disabled" @change="onChange">
        <a-radio v-for="item in options" :key="item.key" :value="item.value" @blur="blur">{{ item.label }}</a-radio>
      </a-radio-group>
    </div>
  </div>
</template>
<script lang="ts">
import { ActiveRecord, translateValueByKey } from '@oinone/kunlun-engine';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { Radio as ARadio, RadioGroup as ARadioGroup } from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';

const MOCK_OPTIONS = ['1', '2', '3'].map((v) => ({
  key: v,
  value: v,
  label: `${translateValueByKey('选项')}${v}`,
  data: {}
}));

export default defineComponent({
  name: 'DefaultRadio',
  components: {
    ARadioGroup,
    ARadio
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    options: {
      type: Array as PropType<SelectItem<ActiveRecord>[]>
    },
    orientation: {
      type: String
    },
    selectedValue: {
      type: String as PropType<string>
    },
    onSelectedChange: {
      type: Function as PropType<(key: string | undefined) => void>
    },
    _FROM_UI_DESIGNER: {
      type: Boolean
    }
  },
  setup(props) {
    const { readonly, disabled } = useMetadataProps(props, true);

    const options = computed<SelectItem<ActiveRecord>[]>(() => {
      if (props._FROM_UI_DESIGNER) {
        return MOCK_OPTIONS;
      }
      return props.options || [];
    });

    const onChange = (e: { target: { value: string } } & MouseEvent) => {
      const {
        target: { value }
      } = e;
      props.onSelectedChange?.(value);
      e?.preventDefault?.();
      e?.stopPropagation?.();
    };

    return {
      options,
      readonly,
      disabled,

      onChange
    };
  }
});
</script>

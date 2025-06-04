<template>
  <div class="form-multi-enum-checkbox-group">
    <div class="not-readonly" v-if="!readonly || (readonly && disabled)">
      <a-checkbox-group :value="selectedValues" :disabled="disabled" @change="onChange">
        <a-checkbox v-for="item in options" :key="item.key" :value="item.value" @blur="blur"
          >{{ item.label }}
        </a-checkbox>
      </a-checkbox-group>
    </div>
  </div>
</template>
<script lang="ts">
import { ActiveRecord, translateValueByKey } from '@oinone/kunlun-engine';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { Checkbox as ACheckbox, CheckboxGroup as ACheckboxGroup } from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';

const MOCK_OPTIONS = ['1', '2', '3'].map((v) => ({
  key: v,
  value: v,
  label: `${translateValueByKey('选项')}${v}`,
  data: {}
}));

export default defineComponent({
  name: 'DefaultCheckbox',
  components: {
    ACheckboxGroup,
    ACheckbox
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    options: {
      type: Array as PropType<SelectItem<ActiveRecord>[]>
    },
    selectedValues: {
      type: Array as PropType<string[]>
    },
    onSelectedChange: {
      type: Function as PropType<(keys: string[]) => void>
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

    const onChange = (keys: string[]) => {
      props.onSelectedChange?.(keys);
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

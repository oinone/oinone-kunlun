<template>
  <div class="form-multi-enum-checkbox-group">
    <div class="not-readonly" v-if="!readonly || (readonly && disabled)">
      <a-checkbox-group
        :class="orientation === 'VERTICAL' ? 'vertical' : ''"
        :value="realValue"
        :disabled="disabled"
        @change="tickChange"
      >
        <a-checkbox
          v-for="item in realOptions"
          :class="orientation === 'VERTICAL' && item.hint ? 'has-hint' : ''"
          :key="item.key"
          :disabled="item.disabled && !(realValue && realValue.includes(item.value))"
          :value="item.value"
          @blur="blur"
          >{{ item.label }}
          <template v-if="orientation === 'VERTICAL' && item.hint">
            <br />
            <span class="item-hint">{{ item.hint }}</span>
          </template>
        </a-checkbox>
      </a-checkbox-group>
    </div>
    <div class="readonly" v-else-if="readonly && multiSelectLabel">{{ multiSelectLabel }}</div>
    <div class="readonly empty-value" v-else-if="readonly && !multiSelectLabel">-</div>
  </div>
</template>
<script lang="ts">
import { RuntimeEnumerationOption } from '@kunlun/engine';
import { SelectItem } from '@kunlun/vue-ui-common';
import { isEmpty, isNil } from 'lodash-es';
import { computed, defineComponent, PropType, watch } from 'vue';
import { Checkbox as ACheckbox, CheckboxGroup as ACheckboxGroup } from 'ant-design-vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';
import { multiEnumFetchLabelByValue, optionsConvertSelectItem } from '../../../util';

export default defineComponent({
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Array]
    },
    defaultValue: {
      type: [String, Array]
    },
    allowClear: {
      type: Boolean
    },
    orientation: {
      type: String
    },
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>
    }
  },
  components: {
    ACheckbox,
    ACheckboxGroup
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props, true);

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() =>
      optionsConvertSelectItem(props.options).filter((v) => !v.data.invisible)
    );

    const multiSelectLabel = computed(() => {
      if (isNil(realValue.value)) {
        return '';
      }
      return multiEnumFetchLabelByValue(realValue.value, props.options);
    });

    watch(
      () => props.value,
      (newVal) => {
        realValue.value = newVal;
      }
    );

    watch(
      () => props.defaultValue,
      (v) => {
        if (isEmpty(props.value)) {
          realValue.value = v;
        }
      }
    );

    const tickChange = (val) => {
      realValue.value = val;
      if (props.change) {
        props.change(val);
      }
    };

    return {
      realValue,
      readonly,
      disabled,
      multiSelectLabel,
      realOptions,
      tickChange
    };
  }
});
</script>

<template>
  <div class="form-enum-radio">
    <div class="not-readonly" v-if="!readonly || (readonly && disabled)">
      <a-radio-group
        v-for="(optGroup, index) in realButtonOptions"
        class="button-group"
        :buttonStyle="buttonStyle"
        :value="currentValue"
        :disabled="disabled"
        :key="index"
      >
        <div v-if="radioMode === 'BUTTON'">
          <a-radio-button
            v-for="item in optGroup"
            v-show="computeItemShow(item.data)"
            :class="computeRadioClass(item.data)"
            :key="item.key"
            :disabled="item.disabled && currentValue !== item.value"
            :value="item.value"
            :style="extraButtonStyle"
            @mousedown.stop="clickRadio(item.data, item.disabled)"
          >
            <span
              class="button-content"
              :title="item.label || item.displayName"
              @mousedown.stop="clickRadio(item.data, item.disabled)"
            >
              {{ item.label || item.displayName }}
            </span>
          </a-radio-button>
        </div>
        <div v-else :class="computeRadioGroupClass">
          <a-radio
            v-for="item in realOptions"
            v-show="computeItemShow(item.data)"
            :class="computeRadioClass(item.data)"
            :key="item.key"
            :value="item.value"
            :disabled="item.disabled && currentValue !== item.value"
            @mousedown.stop="clickRadio(item.data, item.disabled)"
          >
            <span
              class="oio-radio-label"
              :title="item.label || item.displayName"
              @mousedown.stop="clickRadio(item.data, item.disabled)"
              >{{ item.label || item.displayName }}</span
            >
            <oio-tooltip-help v-if="item.data?.help" :content="item.data?.help" />
            <br />
            <span v-if="computeItemHintIf(item.data)" class="item-hint">{{ item.data.hint }}</span>
          </a-radio>
        </div>
      </a-radio-group>
    </div>
    <div class="readonly" v-else-if="readonly && radioLabel">{{ radioLabel }}</div>
    <div class="readonly empty-value" v-else-if="readonly && !radioLabel">-</div>
  </div>
</template>
<script lang="ts">
import { RuntimeEnumerationOption } from '@kunlun/engine';
import { OioTooltipHelp } from '@kunlun/vue-ui-antd';
import { SelectItem } from '@kunlun/vue-ui-common';
import { Radio as ARadio, RadioButton as ARadioButton, RadioGroup as ARadioGroup } from 'ant-design-vue';
import { isNil, toNumber, toString } from 'lodash-es';
import { computed, defineComponent, PropType, watch } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';
import { arrSplit, enumFetchLabelByValue, optionsConvertSelectItem } from '../../../util';

enum OrientationEnum {
  VERTICAL = 'VERTICAL',
  TRANSVERSE = 'TRANSVERSE'
}

export default defineComponent({
  components: {
    OioTooltipHelp,
    ARadio,
    ARadioGroup,
    ARadioButton
  },
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Boolean],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean],
      default: undefined
    },
    allowClear: {
      type: Boolean,
      default: false
    },
    radioMode: {
      type: String
    },
    buttonStyle: {
      type: String,
      default: 'solid'
    },
    orientation: {
      type: String
    },
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>
    },
    autocorrection: {
      type: Boolean,
      default: false
    },
    rowLimit: {
      type: [String, Number],
      default: 0
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props);

    const currentValue = computed(() => {
      const value = realValue.value;
      if (value == null) {
        return undefined;
      }
      return toString(value);
    });

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() => optionsConvertSelectItem(props.options));

    const radioLabel = computed(() => {
      return enumFetchLabelByValue(currentValue.value, props.options);
    });

    const realButtonOptions = computed<SelectItem<RuntimeEnumerationOption>[][]>(() => {
      const options = realOptions.value;
      if (toNumber(props.rowLimit) <= 0 || props.radioMode !== 'BUTTON') {
        return [options];
      }
      if (options && options.length > 0) {
        return arrSplit(options, toNumber(props.rowLimit));
      }
      return [];
    });

    const extraButtonStyle = computed(() => {
      let _rowLimit = toNumber(props.rowLimit);
      const _length = (props.options && props.options.length) || 1;
      if (_rowLimit <= 0) {
        _rowLimit = _length;
      }
      return `width: ${100 / _rowLimit}%`;
    });

    const computeRadioGroupClass = computed(() => {
      return props.orientation === OrientationEnum.VERTICAL ? 'vertical' : '';
    });

    const computeValue = (item) => {
      return item.name === 'false' || item.name === 'true' ? JSON.parse(item.name) : item.name;
    };

    const computeItemShow = (item) => {
      return item.invisible === false || item.invisible === undefined;
    };

    const computeRadioClass = (item) => {
      return props.orientation === OrientationEnum.VERTICAL && item.hint ? 'has-hint' : '';
    };

    const computeItemHintIf = (item) => {
      return props.orientation === OrientationEnum.VERTICAL && item.hint;
    };

    const onChange = (selectedItem) => {
      props.change?.(computeValue(selectedItem));
    };

    const clickRadio = (val, itemDisabled) => {
      if (disabled.value || itemDisabled) {
        return;
      }
      if (!isNil(currentValue.value) && val.toString() === currentValue.value) {
        if (props.change && props.allowClear) {
          realValue.value = undefined;
          props.change(realValue.value);
        }
      } else {
        onChange(val);
      }
      props.blur?.();
    };

    const autocorrection = (options: SelectItem<RuntimeEnumerationOption>[][]) => {
      const selectedKey = currentValue.value;
      if (!selectedKey) {
        return;
      }
      let selectedItem = findSelectItem(options, selectedKey);
      if (selectedItem) {
        return;
      }
      const defaultActiveKey = toString(props.defaultValue);
      if (defaultActiveKey) {
        selectedItem = findSelectItem(options, defaultActiveKey);
        if (selectedItem) {
          onChange(selectedItem.value);
          return;
        }
      }
      onChange(options?.[0]?.[0]?.value);
    };

    const findSelectItem = (options: SelectItem<RuntimeEnumerationOption>[][], key: string) => {
      for (const optGroup of options) {
        const selectItem = optGroup.find((v) => v.value === key);
        if (selectItem) {
          return selectItem;
        }
      }
      return undefined;
    };

    watch(realButtonOptions, (val) => {
      if (props.autocorrection) {
        autocorrection(val);
      }
    });

    return {
      currentValue,
      readonly,
      disabled,
      realOptions,
      computeRadioGroupClass,
      realButtonOptions,
      extraButtonStyle,
      computeItemShow,
      computeRadioClass,
      computeItemHintIf,
      radioLabel,
      clickRadio
    };
  }
});
</script>

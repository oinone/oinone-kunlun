<script lang="ts">
import { type CSSStyle, DateTimePickerMode, StringHelper } from '@oinone/kunlun-shared';
import { OioDateTimeRangePickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { ElDatePicker, ElTimePicker } from 'element-plus';
import { isArray } from 'lodash-es';
import { type Component, createVNode, defineComponent, VNodeProps } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { fetchDatetimeRangePickerPlaceholder, useDateTimeRangePickerProps } from './use-date-time-range-picker-props';

export default defineComponent({
  name: 'OioDateTimeRangePicker',
  components: {
    ElDatePicker,
    ElTimePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimeRangePickerProps
  },
  emits: ['update:value'],
  setup(props, context) {
    return {
      ...useDateTimeRangePickerProps(props, context)
    };
  },
  render() {
    let component: Component = ElDatePicker;
    if (this.mode === DateTimePickerMode.time) {
      component = ElTimePicker;
    }
    const datetimePickerClassList = [
      `${DEFAULT_PREFIX}-date-time-range-picker`,
      `${DEFAULT_PREFIX}-date-time-range-picker-${this.mode}`
    ];
    if (this.readonly) {
      datetimePickerClassList.push(`${DEFAULT_PREFIX}-date-time-range-picker-readonly`);
    }
    if (this.disabled) {
      datetimePickerClassList.push(`${DEFAULT_PREFIX}-date-time-range-picker-disabled`);
    }
    const componentProps: Record<string, unknown> & VNodeProps = {
      ...PropRecordHelper.collectionBasicProps(this.$attrs, datetimePickerClassList, {
        width: '100%'
      } as CSSStyle),
      modelValue: this.value,
      'onUpdate:model-value': (val) => {
        this.emitValue(val);
      },
      defaultValue: this.defaultValue,
      readonly: this.readonly,
      disabled: this.disabled || this.readonly,
      format: this.$translate(this.format),
      valueFormat: this.valueFormat,
      clearable: this.allowClear,
      // 与 antd showOk=false 保持一致，不显示确认按钮，选择后直接生效
      showConfirm: false,
      appendTo: this.getTriggerContainer?.(),
      rangeSeparator: this.separator,
      shortcuts: this.shortcuts,
      defaultTime: this.defaultTime,
      onVisibleChange: this.panelVisibleChange,
      popperClass: StringHelper.append(
        [
          `${DEFAULT_PREFIX}-date-time-range-picker-popper`,
          `${DEFAULT_PREFIX}-date-time-range-picker-popper-${this.mode}`
        ],
        this.popperClass || this.dropdownClassName
      ).join(' ')
    };

    if (component === ElDatePicker) {
      componentProps.type = this.realType;
    } else {
      componentProps.isRange = true;
    }

    // antd 的 placeholder 数组 → element-plus 的开始/结束占位符
    const placeholder =
      this.placeholder === undefined ? fetchDatetimeRangePickerPlaceholder(this.mode) : this.placeholder;
    if (isArray(placeholder)) {
      componentProps.startPlaceholder = this.$translate(placeholder[0]);
      componentProps.endPlaceholder = this.$translate(placeholder[1]);
    } else {
      componentProps.startPlaceholder = this.$translate(placeholder);
      componentProps.endPlaceholder = this.$translate(placeholder);
    }

    return createVNode(component, componentProps);
  }
});
</script>

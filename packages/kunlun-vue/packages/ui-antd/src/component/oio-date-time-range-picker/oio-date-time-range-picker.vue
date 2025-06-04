<script lang="ts">
import { CSSStyle, DateTimePickerMode, StringHelper } from '@oinone/kunlun-shared';
import { OioDateTimeRangePickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { RangePicker as ARangePicker } from 'ant-design-vue';
import { Component, createVNode, defineComponent, VNodeProps } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { fetchDatetimeRangePickerPlaceholder, useDatetimeRangePickerProps } from './use-date-time-range-picker-props';

export default defineComponent({
  name: 'OioDateTimeRangePicker',
  components: {
    ARangePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimeRangePickerProps
  },
  emits: ['update:value'],
  setup(props, context) {
    return {
      ...useDatetimeRangePickerProps(props, context)
    };
  },
  render() {
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
      defaultValue: this.defaultValue,
      placeholder: this.placeholder,
      readonly: this.readonly,
      inputReadOnly: this.readonly,
      disabled: this.disabled || this.readonly,
      format: this.$translate(this.format),
      valueFormat: this.valueFormat,
      value: this.value,
      allowClear: this.allowClear,
      showTime: this.showTime,
      separator: this.separator,
      showOk: false,
      'onUpdate:value': (val) => {
        this.emitValue(val);
      },
      open: this.panelVisible,
      onOpenChange: this.panelVisibleChange,
      getPopupContainer: this.getTriggerContainer
    };

    if (this.dynamicMode === DateTimePickerMode.month) {
      componentProps.picker = this.dynamicMode;
    } else if (this.mode !== DateTimePickerMode.datetime) {
      componentProps.picker = this.mode;
    }

    if (this.placeholder === undefined) {
      componentProps.placeholder = fetchDatetimeRangePickerPlaceholder(this.mode).map((a) => this.$translate(a));
    } else {
      componentProps.placeholder = this.placeholder;
    }
    const dropdownClassName = StringHelper.append(
      [
        `${DEFAULT_PREFIX}-date-time-range-picker-popper`,
        `${DEFAULT_PREFIX}-date-time-range-picker-popper-${this.mode}`
      ],
      this.popperClass || this.dropdownClassName
    ).join(' ');
    const component: Component = ARangePicker;
    componentProps.dropdownClassName = dropdownClassName;
    return createVNode(component, componentProps);
  }
});
</script>

<script lang="ts">
import { CSSStyle, DateTimePickerMode, StringHelper } from '@oinone/kunlun-shared';
import { OioDateTimePickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { DatePicker as ADatePicker, TimePicker as ATimePicker } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import { Component, createVNode, defineComponent, VNodeProps } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { fetchDatetimePickerPlaceholder, useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'OioDateTimePicker',
  components: {
    ADatePicker,
    ATimePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerProps
  },
  emits: ['update:value'],
  slots: ['dateRender', 'renderExtraFooter'],
  setup(props, context) {
    return {
      ...useDateTimePickerProps(props, context)
    };
  },
  render() {
    const datetimePickerClassList = [`${DEFAULT_PREFIX}-date-time-picker`];
    if (this.readonly) {
      datetimePickerClassList.push(`${DEFAULT_PREFIX}-date-time-picker-readonly`);
    }
    const componentProps: Record<string, unknown> & VNodeProps = {
      defaultValue: this.defaultValue,
      readonly: this.readonly,
      inputReadOnly: this.readonly,
      disabled: this.disabled,
      format: this.$translate(this.format),
      valueFormat: this.valueFormat,
      value: this.value,
      allowClear: this.allowClear,
      locale: this.locale,
      showTime: this.showTime,
      showToday: this.showToday,
      disabledDate: this.disabledDate,
      disabledTime: this.disabledTime,
      showOk: false,
      ...PropRecordHelper.collectionBasicProps(this.$attrs, datetimePickerClassList, { minWidth: 'unset' } as CSSStyle),
      'onUpdate:value': (val) => {
        this.emitValue(val);
      },
      open: this.changeOpenValue && !isNil(this.open) ? this.open : this.panelVisible,
      changeOpenValue: this.changeOpenValue,
      onPanelChange: this.panelChange,
      onOpenChange: this.panelVisibleChange,
      getPopupContainer: this.getTriggerContainer
    };
    if (this.placeholder === undefined) {
      componentProps.placeholder = this.$translate(fetchDatetimePickerPlaceholder(this.mode));
    } else {
      componentProps.placeholder = this.placeholder;
    }
    const dropdownClassName = StringHelper.append(
      [`${DEFAULT_PREFIX}-date-time-picker-popper`],
      this.dropdownClassName
    ).join(' ');
    let component: Component = ADatePicker;
    if (this.mode === DateTimePickerMode.time) {
      component = ATimePicker;
      componentProps.popupClassName = dropdownClassName;
    } else {
      componentProps.dropdownClassName = dropdownClassName;
    }
    if ([DateTimePickerMode.year, DateTimePickerMode.month, DateTimePickerMode.week].includes(this.mode)) {
      componentProps.picker = this.mode;
    } else if (this.dynamicMode) {
      if (this.dynamicMode === DateTimePickerMode.month) {
        componentProps.picker = this.dynamicMode;
      } else if (this.dynamicMode !== DateTimePickerMode.date) {
        // antd的mode的默认值是date，但是我们不能配置为date，配置为date就会不能选择 年和月 的九宫格面板
        componentProps.mode = this.dynamicMode;
      }
    }

    return createVNode(
      component,
      componentProps,
      PropRecordHelper.collectionSlots(this.$slots, ['dateRender', 'renderExtraFooter'])
    );
  }
});
</script>

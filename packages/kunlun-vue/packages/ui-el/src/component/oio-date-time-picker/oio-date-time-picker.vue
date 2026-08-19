<script lang="ts">
import { type CSSStyle, DateTimePickerMode, StringHelper } from '@oinone/kunlun-shared';
import { OioDateTimePickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { ElDatePicker, ElTimePicker } from 'element-plus';
import { type Component, createVNode, defineComponent, VNodeProps } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { fetchDatetimePickerPlaceholder, useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'OioDateTimePicker',
  components: {
    ElDatePicker,
    ElTimePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerProps
  },
  emits: ['update:value'],
  setup(props, context) {
    return {
      ...useDateTimePickerProps(props, context)
    };
  },
  render() {
    let component: Component = ElDatePicker;
    if (this.realMode === DateTimePickerMode.time) {
      component = ElTimePicker;
    }
    const datetimePickerClassList = [`${DEFAULT_PREFIX}-date-time-picker`];
    if (this.readonly) {
      datetimePickerClassList.push(`${DEFAULT_PREFIX}-date-time-picker-readonly`);
    }
    const componentProps: Record<string, unknown> & VNodeProps = {
      ...PropRecordHelper.collectionBasicProps(this.$attrs, datetimePickerClassList, {
        minWidth: 'unset'
      } as CSSStyle),
      modelValue: this.value,
      'onUpdate:model-value': (val) => {
        this.emitValue(val);
      },
      defaultValue: this.defaultValue,
      readonly: this.readonly,
      disabled: this.disabled,
      format: this.$translate(this.format),
      valueFormat: this.valueFormat,
      clearable: this.allowClear,
      shortcuts: this.shortcuts,
      defaultTime: this.defaultTime,
      disabledDate: this.disabledDate,
      ...this.disabledTimeProps,
      // 与 antd showOk=false 保持一致，不显示确认按钮，选择后直接生效
      showConfirm: false,
      appendTo: this.getTriggerContainer?.(),
      onVisibleChange: this.panelVisibleChange,
      popperClass: StringHelper.append([`${DEFAULT_PREFIX}-date-time-picker-popper`], this.dropdownClassName).join(' ')
    };

    if (component === ElDatePicker) {
      componentProps.type = this.realType;
      // antd showToday=false 时隐藏今天按钮，element-plus 日期面板通过关闭底部栏实现
      if (this.showToday === false && this.realMode === DateTimePickerMode.date) {
        componentProps.showFooter = false;
      }
      componentProps.onPanelChange = this.panelChange;
    }

    if (this.placeholder === undefined) {
      componentProps.placeholder = this.$translate(fetchDatetimePickerPlaceholder(this.realMode));
    } else {
      componentProps.placeholder = this.placeholder;
    }

    return createVNode(component, componentProps);
  }
});
</script>

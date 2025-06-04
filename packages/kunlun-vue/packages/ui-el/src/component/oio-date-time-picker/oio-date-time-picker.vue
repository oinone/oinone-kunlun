<script lang="ts">
import { CastHelper, DateTimePickerMode, DateUtil, defaultFormat, StringHelper } from '@oinone/kunlun-shared';
import { OioDateTimePickerProps } from '@oinone/kunlun-vue-ui-common';
import { ElDatePicker, ElTimePicker } from 'element-plus';
import { Component, computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

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
  setup(props) {
    const getDateTimeFormat = () => {
      return DateUtil.fetchDatetimeFormat(
        { hasDateFormat: props.hasDateFormat, hasTimeFormat: props.hasTimeFormat },
        props.format,
        props.dateFormat,
        props.timeFormat,
        props.convertFormat,
        props.convertDateFormat,
        props.convertTimeFormat
      );
    };

    const format = computed(() => {
      return getDateTimeFormat() || defaultFormat;
    });

    const valueFormat = computed(() => {
      return props.valueFormat || defaultFormat;
    });

    const defaultValue = computed(() => {
      return DateUtil.toDate(props.defaultValue, valueFormat.value);
    });

    return {
      format,
      valueFormat,
      defaultValue
    };
  },
  render() {
    let component: Component = ElDatePicker;
    if (this.mode === DateTimePickerMode.time) {
      component = ElTimePicker;
    }
    const datetimePickerClassList = [`${DEFAULT_PREFIX}-date-time-picker`];
    if (this.readonly) {
      datetimePickerClassList.push(`${DEFAULT_PREFIX}-date-time-picker-readonly`);
    }
    return createVNode(component, {
      defaultValue: this.defaultValue,
      placeholder: this.placeholder,
      readonly: this.readonly,
      disabled: this.disabled,
      format: this.format,
      valueFormat: this.valueFormat,
      ...this.$attrs,
      modelValue: this.value,
      'onUpdate:model-value': (val) => {
        this.$emit('update:value', val);
      },
      type: this.mode,
      clearable: this.allowClear,
      class: StringHelper.append(datetimePickerClassList, CastHelper.cast(this.$attrs.class)),
      popperClass: StringHelper.append([`${DEFAULT_PREFIX}-date-time-picker-popper`], this.dropdownClassName)
    });
  }
});
</script>

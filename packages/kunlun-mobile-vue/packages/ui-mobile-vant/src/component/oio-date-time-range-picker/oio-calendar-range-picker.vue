<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { OioDateTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent, VNodeProps } from 'vue';
import { Calendar as VanCalendar } from 'vant';
import dayjs from 'dayjs';
import { DEFAULT_PREFIX } from '../../theme';
import { fetchDatetimeRangePickerPlaceholder, useDatetimeRangePickerProps } from './use-date-time-range-picker-props';

export default defineComponent({
  name: 'OioCalendarRangePicker',
  components: {
    VanCalendar
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimeRangePickerProps
  },
  emits: ['update:value'],
  setup(props, context) {
    return { ...useDatetimeRangePickerProps(props, context) };
  },
  render() {
    const datePickerClassList = [
      `${DEFAULT_PREFIX}-date-time-picker`,
      `${DEFAULT_PREFIX}-calendar-range-picker`,
      `${DEFAULT_PREFIX}-calendar-range-picker-${this.mode}`
    ];
    if (this.readonly) {
      datePickerClassList.push(`${DEFAULT_PREFIX}-calendar-range-picker-readonly`);
    }
    const componentProps: Record<string, unknown> & VNodeProps = {
      title: this.title,
      show: this.show,
      'onUpdate:show': (val) => {
        this.show = val;
      },
      type: 'range',
      teleport: 'body',
      minDate: dayjs().subtract(1, 'year').toDate(),
      maxDate: dayjs().add(1, 'year').toDate(),
      onConfirm: this.onConfirm,
      defaultDate: this.defaultDate,
      ...this.$attrs,
      class: StringHelper.append(datePickerClassList, CastHelper.cast(this.$attrs.class))
    };
    if (this.placeholder === undefined) {
      componentProps.placeholder = fetchDatetimeRangePickerPlaceholder(this.mode);
    } else {
      componentProps.placeholder = this.placeholder;
    }
    if (Array.isArray(componentProps.placeholder)) {
      componentProps.placeholder = componentProps.placeholder.join(',');
    }
    const popperClassName = StringHelper.append(
      [`${DEFAULT_PREFIX}-calendar-range-picker-popper`, `${DEFAULT_PREFIX}-calendar-range-picker-popper-${this.mode}`],
      this.popperClass
    ).join(' ');
    componentProps.dropdownClassName = popperClassName;
    return createVNode(
      'div',
      {
        class: StringHelper.append(datePickerClassList, CastHelper.cast(this.$attrs.class)),
        onClick: () => {
          if (this.disabled || this.readonly) {
            return;
          }
          this.show = !this.show;
        }
      },
      [
        createVNode('input', {
          class: `${DEFAULT_PREFIX}-input van-field__control`,
          readonly: true,
          value: this.value,
          placeholder: componentProps.placeholder
        }),
        createVNode(VanCalendar, componentProps)
      ]
    );
  }
});
</script>

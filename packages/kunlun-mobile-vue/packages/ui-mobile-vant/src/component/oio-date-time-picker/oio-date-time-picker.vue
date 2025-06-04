<script lang="ts">
import { CastHelper, DateTimePickerMode, DateUtil, StringHelper } from '@oinone/kunlun-shared';
import { OioDateTimePickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { DatetimePicker as VanDatetimePicker, Popup as VanPopup } from 'vant';
import { createVNode, defineComponent, ref, VNodeProps } from 'vue';
import dayjs from 'dayjs';
import { isString } from 'lodash-es';

import { DEFAULT_PREFIX } from '../../theme';
import { fetchDatetimePickerPlaceholder, useDateTimePickerProps } from './use-date-time-picker-props';
import OioCustomInput from '../oio-input/oio-custome-input.vue';

export default defineComponent({
  name: 'OioDateTimePicker',
  components: {
    VanDatetimePicker,
    VanPopup
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerProps
  },
  emits: ['update:value', 'change'],
  setup(props, context) {
    const show = ref(false);
    return {
      ...useDateTimePickerProps(props, context),
      show
    };
  },
  render() {
    const datetimePickerClassList = [`${DEFAULT_PREFIX}-date-time-picker`];
    if (this.readonly) {
      datetimePickerClassList.push(`${DEFAULT_PREFIX}-date-time-picker-readonly`);
    }

    let modelValue;

    if (this.mode === DateTimePickerMode.time) {
      modelValue = this.value ? this.value : DateUtil.dateFormat(new Date(), this.format);
    } else {
      modelValue = this.value ? new Date(this.value) : new Date();
    }

    const componentProps: Record<string, unknown> & VNodeProps = {
      class: [`${DEFAULT_PREFIX}-date-time-picker-popper`, `${DEFAULT_PREFIX}-date-time-picker-popper-${this.mode}`],
      type: this.mode === 'year' ? 'year-month' : this.mode,
      defaultValue: this.defaultValue,
      readonly: this.readonly,
      disabled: this.disabled,
      // format: this.format,
      formatter: this.formatter,
      // valueFormat: this.valueFormat,
      modelValue,
      allowClear: this.allowClear,
      locale: this.locale,
      showTime: this.showTime,
      showOk: false,
      'onUpdate:value': (val) => {
        this.$emit('update:value', val);
      },
      inputReadonly: true,
      open: this.panelVisible,
      style: {
        minWidth: 'unset'
      } as CSSStyleDeclaration,
      onPanelChange: this.panelChange,
      onConfirm: (datetime) => {
        const str = isString(datetime) ? `${datetime}:00` : dayjs(datetime).format(this.valueFormat);
        this.$emit('update:value', str);
        this.$emit('change', str);
        this.show = false;
      },
      onCancel: () => {
        this.show = false;
      },
      ...PropRecordHelper.convert(OioDateTimePickerProps, CastHelper.cast(this)),
      ...this.$attrs
    };
    if (this.placeholder === undefined) {
      componentProps.placeholder = fetchDatetimePickerPlaceholder(this.mode);
    } else {
      componentProps.placeholder = this.placeholder;
    }
    if (this.dynamicMode) {
      componentProps.mode = this.dynamicMode;
    }
    componentProps.inputReadonly = true;
    const pickerVNode = createVNode(VanDatetimePicker, componentProps);
    const popupVNode = createVNode(
      VanPopup,
      {
        teleport: 'body',
        round: true,
        position: 'bottom',
        show: this.show,
        safeAreaInsetBottom: true,
        'onUpdate:show': (val) => (this.show = val)
      },
      { default: () => pickerVNode }
    );

    return createVNode(
      'div',
      {
        class: StringHelper.append(datetimePickerClassList, CastHelper.cast(this.$attrs.class)),
        onClick: () => {
          if (this.disabled || this.readonly) {
            return;
          }
          this.show = !this.show;
        }
      },
      {
        default: () => [
          createVNode(OioCustomInput, {
            class: `${DEFAULT_PREFIX}-input van-field__control`,
            readonly: true,
            value: this.formatDisplayValue,
            placeholder: componentProps.placeholder
          }),
          popupVNode
        ]
      }
    );
  }
});
</script>

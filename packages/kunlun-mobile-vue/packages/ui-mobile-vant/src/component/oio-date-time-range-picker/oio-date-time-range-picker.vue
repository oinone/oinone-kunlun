<template>
  <div :class="classList">
    <template v-if="!readonly && !disabled">
      <oio-custom-input
        :class="`${DEFAULT_PREFIX}-input van-field__control ${DEFAULT_PREFIX}-start-datetime`"
        readonly
        :value="displayStartDatetime"
        :placeholder="placeholder && placeholder[0]"
        @click="showPopup(false)"
      />
      <span :class="`${baseClassName}-separator`">{{ separator }}</span>
      <oio-custom-input
        :class="`${DEFAULT_PREFIX}-input van-field__control ${DEFAULT_PREFIX}-end-datetime`"
        readonly
        :value="displayEndDatetime"
        :placeholder="placeholder && placeholder[1]"
        @click="showPopup(true)"
      />
      <van-popup
        v-model:show="show"
        :class="popperClassName"
        safe-area-inset-bottom
        round
        position="bottom"
        :teleport="popupTeleport"
      >
        <van-datetime-picker
          v-model="datetimeValue"
          :title="datetimePickerTitle"
          :defaultValue="defaultValue"
          :formatter="formatter"
          :type="mode === 'year' ? 'year-month' : mode"
          :minDate="minDate"
          :maxDate="maxDate"
          @confirm="popupConfirm"
          @cancel="popupCancel"
        />
      </van-popup>
    </template>
    <div class="readonly" v-else-if="readonly && displayLabel">{{ displayLabel }}</div>
    <div class="readonly empty-value" v-else-if="readonly && !displayLabel">-</div>
  </div>
</template>
<script lang="ts">
import { DateTimePickerMode, DateUtil, StringHelper } from '@kunlun/shared';
import { OioDateTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { computed, defineComponent, ref } from 'vue';
import { DatetimePicker as VanDatetimePicker, Popup as VanPopup } from 'vant';
import { isString } from 'lodash-es';
import { DEFAULT_PREFIX } from '../../theme';
import { useDatetimeRangePickerProps } from './use-date-time-range-picker-props';
import OioCustomInput from '../oio-input/oio-custome-input.vue';

export default defineComponent({
  name: 'OioDateTimeRangePicker',
  components: {
    VanDatetimePicker,
    VanPopup,
    OioCustomInput
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimeRangePickerProps,
    popupTeleport: {
      type: [String, HTMLElement],
      default: 'body'
    }
  },
  emits: ['update:value', 'change'],
  setup(props, context) {
    const commonContext = useDatetimeRangePickerProps(props, context);
    const baseClassName = `${DEFAULT_PREFIX}-date-time-range-picker`;
    const classList = computed(() => {
      const list = [baseClassName, `${baseClassName}-${props.mode}`];
      if (props.readonly) {
        list.push(`${baseClassName}-readonly`);
      }
      return list;
    });

    const popperClassName = computed(() => {
      return StringHelper.append(
        [`${baseClassName}-popper`, `${baseClassName}-popper-${props.mode}`],
        props.popperClass
      ).join(' ');
    });

    const startDatetime = computed(() => (props.value && props.value[0] ? props.value[0] : undefined));
    const endDatetime = computed(() =>
      props.value && props.value.length > 1 && props.value[1] ? props.value[1] : undefined
    );
    const displayStartDatetime = computed(
      () =>
        startDatetime.value &&
        DateUtil.autoFormat(props.mode, startDatetime.value! as string, commonContext.format.value)
    );
    const displayEndDatetime = computed(
      () =>
        endDatetime.value && DateUtil.autoFormat(props.mode, endDatetime.value! as string, commonContext.format.value)
    );
    const datetimeValue = ref<string | Date | null | undefined>(null);

    const displayLabel = computed(() => {
      if (!displayStartDatetime.value && !displayEndDatetime.value) {
        return '';
      }
      return [displayStartDatetime.value, displayEndDatetime.value].join(props.separator);
    });

    const show = ref(false);
    const isEndDatetime = ref(false);
    function showPopup(isEnd = false) {
      // console.log('showPopup', isEnd);
      if (!props.disabled && !props.readonly) {
        isEndDatetime.value = isEnd;
        if (props.mode === DateTimePickerMode.time) {
          if (!isEnd && startDatetime.value) {
            datetimeValue.value = isString(startDatetime.value)
              ? startDatetime.value
              : DateUtil.dateFormat(startDatetime.value, commonContext.valueFormat.value)!;
          } else if (isEnd && endDatetime.value) {
            datetimeValue.value = isString(endDatetime.value)
              ? endDatetime.value
              : DateUtil.dateFormat(endDatetime.value, commonContext.valueFormat.value)!;
          } else {
            datetimeValue.value = DateUtil.dateFormat(new Date(), commonContext.valueFormat.value)!;
          }
        } else {
          datetimeValue.value = new Date();
        }
        show.value = true;
      }
    }

    function popupConfirm(datetime: Date | string | undefined) {
      // vant3的日期时间组件中，时间类型的选择后是字符串'23:59',其他类型返回的是date对象
      const str = isString(datetime)
        ? `${datetime}:00`
        : DateUtil.dateFormat(datetime, commonContext.valueFormat.value);
      datetimeValue.value = datetime;
      let startDatetimeStr = startDatetime.value;
      let endDatetimeStr = endDatetime.value;
      if (!isEndDatetime.value) {
        startDatetimeStr = str;
      } else {
        endDatetimeStr = str;
      }
      const value = [startDatetimeStr, endDatetimeStr];
      context.emit('update:value', value);
      context.emit('change', value);

      show.value = false;
    }
    function popupCancel() {
      show.value = false;
    }

    const datetimePickerTitle = computed(() => {
      const [start, end] = props.placeholder || ['', ''];
      const prefix = props.placeholder?.join('-') === props.title ? '' : props.title;
      return [prefix, !isEndDatetime.value ? start : end].filter((a) => !!a).join('-');
    });

    return {
      ...commonContext,
      baseClassName,
      classList,
      popperClassName,
      startDatetime,
      endDatetime,
      displayStartDatetime,
      displayEndDatetime,
      displayLabel,
      DEFAULT_PREFIX,
      show,
      showPopup,
      popupConfirm,
      popupCancel,
      isEndDatetime,
      datetimeValue,
      datetimePickerTitle
    };
  }
});
</script>

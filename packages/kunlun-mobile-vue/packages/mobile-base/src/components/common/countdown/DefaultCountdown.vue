<template>
  <div :class="`${DEFAULT_PREFIX}-default-countdown`">
    <a-tooltip v-if="!isRealEmpty">
      <template #title>
        <span>{{ realValue }}</span>
      </template>
      <span :class="`${DEFAULT_PREFIX}-default-countdown-content`">
        {{ countdownValue }}
      </span>
    </a-tooltip>
  </div>
</template>
<script lang="ts">
import { OioDateTimePickerFormatProps } from '@kunlun/vue-ui-common';
import { computed, defineComponent } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import { useDateTimePicker } from '../../../field/detail/date/use-date-time-picker';
import { DEFAULT_PREFIX } from '../../../ui/theme';

const oneMinutes = 60 * 1000;
const oneHour = oneMinutes * 60;
const oneDay = oneHour * 24;
const threeDay = oneDay * 3;
const thirtyDay = oneDay * 30;

export default defineComponent({
  name: 'DefaultCountdown',
  components: {},
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerFormatProps,
    value: {
      type: [Date, String],
      default: ''
    }
  },
  setup(props) {
    const { realValue, realDateValue, isRealEmpty } = useDateTimePicker(props);

    const countdownValue = computed(() => {
      const dateValue = realDateValue.value;
      if (dateValue) {
        let diff = dateValue.getTime() - new Date().getTime();
        /**
         * 之前
         */
        if (diff <= 0) {
          diff = -diff;
          if (props.hasTimeFormat) {
            if (diff < oneMinutes) {
              return translateValueByKey('刚刚');
            }
            if (diff < oneHour) {
              return `${Math.round(diff / 1000 / 60)}${translateValueByKey('分钟前')}`;
            }
            if (diff < oneDay) {
              return `${Math.round(diff / 1000 / 60 / 60)}${translateValueByKey('小时前')}`;
            }
          }
          if (diff < threeDay) {
            return `${Math.round(diff / 1000 / 60 / 60 / 24)}${translateValueByKey('天前')}`;
          }
          return translateValueByKey('超过3天以上');
        }
        if (props.hasTimeFormat) {
          if (diff < oneMinutes) {
            return translateValueByKey('即将');
          }
          if (diff < oneHour) {
            return `${Math.round(diff / 1000 / 60)}${translateValueByKey('分钟后')}`;
          }
          if (diff < oneDay) {
            return `${Math.round(diff / 1000 / 60 / 60)}${translateValueByKey('小时后')}`;
          }
        }
        if (diff < thirtyDay) {
          return `${Math.round(diff / 1000 / 60 / 60 / 24)}${translateValueByKey('天后')}`;
        }
        return translateValueByKey('大于30天之后');
      }
      return '';
    });

    return {
      DEFAULT_PREFIX,
      realValue,
      isRealEmpty,
      countdownValue
    };
  },
  render() {
    return [];
  }
});
</script>

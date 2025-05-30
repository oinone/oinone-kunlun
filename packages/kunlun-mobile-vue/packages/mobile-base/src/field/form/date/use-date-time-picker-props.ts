import { DateUtil } from '@kunlun/shared';
import { isNil } from 'lodash-es';
import { computed } from 'vue';
import { useMetadataProps } from '../../../basic';

export function useDateTimePickerProps(props) {
  const { realValue, readonly, disabled } = useMetadataProps(props);

  const placeholder = computed(() => {
    if (isNil(props.placeholder)) {
      return undefined;
    }
    if (readonly.value || disabled.value) {
      return '';
    }
    return props.placeholder;
  });

  const format = computed(() => {
    if (props.format) {
      return DateUtil.fixFormat(props.format);
    }
    return undefined;
  });

  const innerChange = (e) => {
    if (props.change) {
      props.change(e);
    }
    if (!e) {
      // 清空事件走关闭面板相同逻辑, 后面走聚焦事件
      props.closePanelChange?.();
    }
  };

  const minDate = computed(() => {
    const date = new Date();
    date.setFullYear(1901);
    date.setMonth(0);
    date.setDate(1);
    date.setHours(0, 0, 0);
    return date;
  });
  const maxDate = computed(() => {
    const date = new Date();
    date.setFullYear(2050);
    date.setMonth(11);
    date.setDate(31);
    date.setHours(23, 59, 59);
    return date;
  });

  return {
    minDate,
    maxDate,
    realValue,
    readonly,
    disabled,
    placeholder,
    format,
    innerChange
  };
}

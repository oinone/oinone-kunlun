import { DateUtil } from '@kunlun/shared';
import { computed } from 'vue';
import { useMetadataProps } from '../../../basic';
import { DateQuickOptionListMap } from './date-common';

export function useDateTimePickerProps(props) {
  const { realValue, readonly, disabled, placeholder } = useMetadataProps(props);

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

  return {
    realValue,
    readonly,
    disabled,
    placeholder,
    format,
    DateQuickOptionListMap,
    innerChange
  };
}

import { isString } from 'lodash-es';
import { computed } from 'vue';
import { usePopup } from '../vc-popup/usePopup';
import { ModalHeight, ModalWidth } from './typing';
import { StyleHelper } from '../../util/style';

export function useModal(props, context) {
  const width = computed(() => {
    const _width = props.width;
    if (isString(_width)) {
      const realWidth = ModalWidth[_width.toLowerCase()];
      if (realWidth) {
        return null;
      }
    }
    return _width;
  });

  const widthClassSuffix = computed(() => {
    const _width = props.width;
    if (isString(_width)) {
      const realWidth = ModalWidth[_width.toLowerCase()];
      if (realWidth) {
        return _width.toLowerCase();
      }
    }
    return undefined;
  });

  const heightClassSuffix = computed(() => {
    const height = props.height;
    if (isString(height)) {
      const realHeight = ModalHeight[height.toLowerCase()];
      if (realHeight) {
        return height.toLowerCase();
      }
    }
    return undefined;
  });

  const heightPx = computed(() => StyleHelper.px(props.height));
  const customHeightClassSuffix = computed(() => {
    if (!heightClassSuffix.value) {
      return !!heightPx.value ? 'custom' : null;
    }

    return null;
  });

  return {
    ...usePopup(props, context),
    width,
    widthClassSuffix,
    heightClassSuffix,
    customHeightClassSuffix,
    heightPx
  };
}

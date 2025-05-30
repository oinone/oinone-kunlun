import { isString } from 'lodash-es';
import { computed } from 'vue';
import { usePopup } from '../vc-popup/usePopup';
import { DrawerHeight, DrawerWidth } from './typing';

export function useDrawer(props, context) {
  const placement = computed(() => {
    return props.placement?.toLowerCase?.();
  });

  const width = computed(() => {
    if (!props.visible) {
      return '0';
    }
    const _width = props.width;
    if (isString(_width)) {
      const realWidth = DrawerWidth[_width.toLowerCase()];
      if (realWidth) {
        return null;
      }
    }
    return _width;
  });

  const widthClassSuffix = computed(() => {
    const _width = props.width;
    if (isString(_width)) {
      const realWidth = DrawerWidth[_width.toLowerCase()];
      if (realWidth) {
        return _width.toLowerCase();
      }
    }
    return undefined;
  });

  const height = computed(() => {
    if (!props.visible) {
      return '0';
    }
    const _height = props.height;
    if (isString(_height)) {
      const realHeight = DrawerHeight[_height.toLowerCase()];
      if (realHeight) {
        return null;
      }
    }
    return _height;
  });

  const heightClassSuffix = computed(() => {
    const _height = props.height;
    if (isString(_height)) {
      const realHeight = DrawerHeight[_height.toLowerCase()];
      if (realHeight) {
        return _height.toLowerCase();
      }
    }
    return undefined;
  });

  return {
    ...usePopup(props, context),
    placement,
    width,
    widthClassSuffix,
    height,
    heightClassSuffix
  };
}

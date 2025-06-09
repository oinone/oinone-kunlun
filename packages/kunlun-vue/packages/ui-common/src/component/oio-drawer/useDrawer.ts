import { isString } from 'lodash-es';
import { computed, ref } from 'vue';
import { usePopup } from '../vc-popup/usePopup';
import { DrawerHeight, DrawerWidth } from './typing';
import { PopupDisplayAs } from '../oio-modal';
import { DEFAULT_PREFIX } from '../../theme';

export function useDrawer(props, context) {
  const displayAs = ref(PopupDisplayAs.DRAWER);

  const isFullScreen = ref(false);
  const internalWidth = ref<keyof typeof DrawerWidth>();
  const internalHeight = ref<keyof typeof DrawerHeight>();

  // 弹窗形式的抽屉
  const modalDrawerClassName = computed(() =>
    displayAs.value === PopupDisplayAs.MODAL ? `${DEFAULT_PREFIX}-drawer-modal-mode` : ''
  );

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
    const _width = internalWidth.value || props.width;
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
    const _height = internalHeight.value || props.height;
    if (isString(_height)) {
      const realHeight = DrawerHeight[_height.toLowerCase()];
      if (realHeight) {
        return _height.toLowerCase();
      }
    }
    return undefined;
  });

  /**
   * 全屏切换
   */
  const onFullSwitch = () => {
    displayAs.value = PopupDisplayAs.DRAWER;

    if (isFullScreen.value) {
      internalHeight.value = undefined;
      internalWidth.value = undefined;
      isFullScreen.value = false;
    } else {
      isFullScreen.value = true;
      internalHeight.value = 'full';
      internalWidth.value = 'full';
    }
  };

  /**
   * 弹窗展示模式切换
   */
  const onDisplayAsSwitch = () => {
    internalHeight.value = undefined;
    internalWidth.value = undefined;
    isFullScreen.value = false;

    if (displayAs.value === PopupDisplayAs.DRAWER) {
      displayAs.value = PopupDisplayAs.MODAL;

      const [key] = Object.entries(DrawerWidth).find(([key, value]) => {
        return key === props.width.toLowerCase();
      }) as any[];

      internalHeight.value = key;
    } else {
      displayAs.value = PopupDisplayAs.DRAWER;
      internalHeight.value = undefined;
    }
  };

  return {
    ...usePopup(props, context),
    placement,
    width,
    widthClassSuffix,
    height,
    heightClassSuffix,
    modalDrawerClassName,
    isFullScreen,
    onFullSwitch,
    onDisplayAsSwitch
  };
}

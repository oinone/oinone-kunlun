import { isString } from 'lodash-es';
import { computed, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { StyleHelper } from '../../util';
import { ModalHeight, ModalWidth } from '../oio-modal';
import { PopupDisplayAs, usePopup } from '../vc-popup';
import { DrawerHeight, DrawerPlacement, DrawerWidth } from './typing';

export function useDrawer(props, context) {
  const internalDisplayAs = ref<PopupDisplayAs | undefined>();
  const displayAs = computed({
    get() {
      if (props.displayAs == null) {
        return internalDisplayAs.value || PopupDisplayAs.drawer;
      }
      return props.displayAs as PopupDisplayAs;
    },
    set(value: PopupDisplayAs) {
      internalDisplayAs.value = value;
      context.emit('update:displayAs', value);
    }
  });

  const isFullScreen = ref(false);
  const internalWidth = ref<keyof typeof DrawerWidth>();
  const internalHeight = ref<keyof typeof DrawerHeight>();

  // 弹窗形式的抽屉
  const modalDrawerClassName = computed(() => {
    const classNames: string[] = [];
    if (displayAs.value === PopupDisplayAs.modal) {
      classNames.push(`${DEFAULT_PREFIX}-drawer-modal-mode`);
      if (height.value == null) {
        classNames.push(`${DEFAULT_PREFIX}-drawer-modal-auto-height`);
      }
    }
    if (internalWidth.value === 'full') {
      classNames.push(`${DEFAULT_PREFIX}-drawer-fullscreen`);
    }
    return classNames;
  });

  const placement = computed(() => {
    if (displayAs.value === PopupDisplayAs.modal) {
      return DrawerPlacement.right;
    }
    return props.placement?.toLowerCase?.();
  });

  const width = computed(() => {
    if (!props.visible) {
      return '0';
    }
    if (internalWidth.value != null) {
      switch (displayAs.value) {
        case PopupDisplayAs.drawer:
          return DrawerWidth[internalWidth.value];
        case PopupDisplayAs.modal:
          return ModalWidth[internalWidth.value];
      }
    }
    const _width = props.width;
    if (isString(_width)) {
      const realWidth = DrawerWidth[_width.toLowerCase()];
      if (realWidth) {
        return '';
      }
    }
    return StyleHelper.px(_width);
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
    if (internalHeight.value != null) {
      switch (displayAs.value) {
        case PopupDisplayAs.drawer:
          return DrawerHeight[internalHeight.value];
        case PopupDisplayAs.modal:
          return ModalHeight[internalHeight.value];
      }
    }
    const _height = props.height;
    if (isString(_height)) {
      const realHeight = DrawerHeight[_height.toLowerCase()];
      if (realHeight) {
        return '';
      }
    }
    return StyleHelper.px(_height);
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
    displayAs.value = PopupDisplayAs.drawer;

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

    if (displayAs.value === PopupDisplayAs.drawer) {
      displayAs.value = PopupDisplayAs.modal;

      const placement = props.placement || DrawerPlacement.right;
      let key: keyof typeof DrawerHeight | undefined;
      switch (placement) {
        case DrawerPlacement.left:
        case DrawerPlacement.right:
          if (typeof props.width === 'string') {
            key = Object.keys(DrawerWidth).find(
              (key) => key === props.width.toLowerCase() || DrawerWidth[key] === props.width
            ) as keyof typeof DrawerHeight | undefined;
          }
          internalHeight.value = key;
          break;
        case DrawerPlacement.top:
        case DrawerPlacement.bottom:
          if (typeof props.height === 'string') {
            key = Object.keys(DrawerHeight).find(
              (key) => key === props.height.toLowerCase() || DrawerHeight[key] === props.height
            ) as keyof typeof DrawerHeight | undefined;
          }
          internalWidth.value = key;
          break;
      }
    } else {
      displayAs.value = PopupDisplayAs.drawer;
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

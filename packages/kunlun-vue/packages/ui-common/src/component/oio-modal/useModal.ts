import { isString } from 'lodash-es';
import { computed, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { StyleHelper } from '../../util';
import { PopupDisplayAs, usePopup } from '../vc-popup';
import { ModalHeight, ModalWidth } from './typing';

export function useModal(props, context) {
  const internalDisplayAs = ref<PopupDisplayAs | undefined>();
  const displayAs = computed({
    get() {
      if (props.displayAs == null) {
        return internalDisplayAs.value || PopupDisplayAs.modal;
      }
      return props.displayAs as PopupDisplayAs;
    },
    set(value: PopupDisplayAs) {
      internalDisplayAs.value = value;
      context.emit('update:displayAs', value);
    }
  });

  const isFullScreen = ref(false);
  const internalWidth = ref<keyof typeof ModalWidth>();
  const internalHeight = ref<keyof typeof ModalHeight>();

  // 抽屉形式的模态框
  const drawerModalClassName = computed(() => {
    const classNames: string[] = [];
    if (displayAs.value === PopupDisplayAs.drawer) {
      classNames.push(`${DEFAULT_PREFIX}-modal-drawer-mode`);
    }
    if (internalWidth.value === 'full') {
      classNames.push(`${DEFAULT_PREFIX}-modal-fullscreen`);
    }
    return classNames;
  });

  const title = computed(() => {
    const val = props.title;
    if (val == null) {
      return '对话框';
    }
    return val;
  });

  const width = computed(() => {
    if (internalWidth.value != null) {
      return ModalWidth[internalWidth.value];
    }
    const width = props.width;
    if (width == null) {
      return ModalWidth.small;
    }
    if (isString(width)) {
      const realWidth = ModalWidth[width.toLowerCase()];
      if (realWidth) {
        return null;
      }
    }
    return StyleHelper.px(width);
  });

  const widthClassSuffix = computed(() => {
    const width = internalWidth.value || props.width;
    if (isString(width)) {
      const realWidth = ModalWidth[width.toLowerCase()];
      if (realWidth) {
        return width.toLowerCase();
      }
    }
    return undefined;
  });

  const height = computed(() => {
    if (internalHeight.value != null) {
      return ModalHeight[internalHeight.value];
    }
    const height = props.height;
    if (height == null) {
      return undefined;
    }
    if (isString(height)) {
      const realHeight = ModalHeight[height.toLowerCase()];
      if (realHeight) {
        return null;
      }
    }
    return StyleHelper.px(height);
  });

  const heightClassSuffix = computed(() => {
    const height = internalHeight.value || props.height;
    if (isString(height)) {
      const realHeight = ModalHeight[height.toLowerCase()];
      if (realHeight) {
        return height.toLowerCase();
      }
    }
    return undefined;
  });

  /**
   * 全屏切换
   */
  const onFullSwitch = () => {
    displayAs.value = PopupDisplayAs.modal;
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

    if (displayAs.value === PopupDisplayAs.modal) {
      displayAs.value = PopupDisplayAs.drawer;
      internalHeight.value = 'full';
    } else {
      displayAs.value = PopupDisplayAs.modal;
      internalHeight.value = undefined;
    }
  };

  return {
    ...usePopup(props, context),
    title,
    width,
    widthClassSuffix,
    height,
    heightClassSuffix,
    isFullScreen,
    drawerModalClassName,
    onFullSwitch,
    onDisplayAsSwitch
  };
}

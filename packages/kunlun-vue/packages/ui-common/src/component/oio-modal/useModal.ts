import { isString } from 'lodash-es';
import { computed, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { StyleHelper } from '../../util';
import { usePopup } from '../vc-popup/usePopup';
import { ModalHeight, ModalWidth, PopupDisplayAs } from './typing';

export function useModal(props, context) {
  const displayAs = ref(PopupDisplayAs.MODAL);

  const isFullScreen = ref(false);
  const internalWidth = ref<keyof typeof ModalWidth>();
  const internalHeight = ref<keyof typeof ModalWidth>();

  // 抽屉形式的模态框
  const drawerModalClassName = computed(() => {
    const classNames: string[] = [];
    if (displayAs.value === PopupDisplayAs.DRAWER) {
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
    const _width = props.width;
    if (_width == null) {
      return ModalWidth.small;
    }
    if (isString(_width)) {
      const realWidth = ModalWidth[_width.toLowerCase()];
      if (realWidth) {
        return null;
      }
    }
    return _width;
  });

  const widthClassSuffix = computed(() => {
    const _width = internalWidth.value || props.width;
    if (isString(_width)) {
      const realWidth = ModalWidth[_width.toLowerCase()];
      if (realWidth) {
        return _width.toLowerCase();
      }
    }
    return undefined;
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

  const heightPx = computed(() => StyleHelper.px(props.height));
  const customHeightClassSuffix = computed(() => {
    if (!heightClassSuffix.value) {
      return !!heightPx.value ? 'custom' : null;
    }

    return null;
  });

  /**
   * 全屏切换
   */
  const onFullSwitch = () => {
    displayAs.value = PopupDisplayAs.MODAL;
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

    if (displayAs.value === PopupDisplayAs.MODAL) {
      displayAs.value = PopupDisplayAs.DRAWER;
      internalHeight.value = 'full';
    } else {
      displayAs.value = PopupDisplayAs.MODAL;
      internalHeight.value = undefined;
    }
  };

  return {
    ...usePopup(props, context),
    title,
    width,
    widthClassSuffix,
    heightClassSuffix,
    customHeightClassSuffix,
    heightPx,
    isFullScreen,
    drawerModalClassName,
    onFullSwitch,
    onDisplayAsSwitch
  };
}

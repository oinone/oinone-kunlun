import type { RuntimeConfigOptions } from '@oinone/kunlun-meta';

export interface PopupConfig extends RuntimeConfigOptions {
  draggable?: boolean;
  isShowMask?: boolean;
  maskClosable?: boolean;
  enabledFullScreen?: boolean;
  showPopupToggle?: boolean;
  showQuickToggle?: boolean;
}

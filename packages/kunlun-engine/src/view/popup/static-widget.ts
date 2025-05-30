import { IPopupWidget } from './typing';

/**
 * 静态弹出层组件
 */
export interface IStaticPopupWidget extends IPopupWidget {
  on(type: 'cancel' | 'ok' | string, handler: Function);
}

/**
 * 静态弹窗组件
 */
export interface IStaticDialogWidget extends IStaticPopupWidget {
  setTeleport(fn: () => HTMLElement);

  setDestroyOnClose(destroyOnClose: boolean);

  setTitle(title: string | null);

  setHelp(help: string | undefined);

  setDraggable(draggable: boolean);

  setWidth(width: string | number);

  setFixedHeight(fixedHeight: string | undefined);

  setZIndex(zIndex: number | undefined);

  setMaskClosable(maskClosable: boolean);

  setHeaderInvisible(headerInvisible: boolean);

  setFooterInvisible(footerInvisible: boolean);

  setOkText(okText: string);

  setOkInvisible(okInvisible: boolean);

  setCancelText(cancelText: string);

  setCancelInvisible(cancelInvisible: boolean);

  setActionLoading(actionLoading: boolean);

  setActionReverse(actionReverse: boolean);
}

/**
 * 静态抽屉组件
 */
export interface IStaticDrawerWidget extends IStaticPopupWidget {
  setTeleport(fn: () => HTMLElement);

  setDestroyOnClose(destroyOnClose: boolean);

  setTitle(title: string | null);

  setHelp(help: string | undefined);

  setPlacement(placement: string);

  setWidth(width: string | number);

  setHeight(height: string | number);

  setZIndex(zIndex: number | undefined);

  setMaskClosable(maskClosable: boolean);

  setHeaderInvisible(headerInvisible: boolean);

  setFooterInvisible(footerInvisible: boolean);

  setOkText(okText: string);

  setOkInvisible(okInvisible: boolean);

  setCancelText(cancelText: string);

  setCancelInvisible(cancelInvisible: boolean);

  setActionLoading(actionLoading: boolean);

  setActionReverse(actionReverse: boolean);
}

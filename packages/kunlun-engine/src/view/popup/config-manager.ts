import { RuntimeConfig } from '@oinone/kunlun-meta';
import type { PopupConfig } from './config';

export class PopupConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): PopupConfig {
    return RuntimeConfig.getConfig<PopupConfig>('popup') || {};
  }

  public static isDraggable(): boolean {
    return PopupConfigManager.getConfig().draggable ?? false;
  }

  public static isShowMask() {
    return PopupConfigManager.getConfig().isShowMask ?? true;
  }

  public static isMaskClosable() {
    return PopupConfigManager.getConfig().maskClosable ?? false;
  }

  public static isEnabledFullScreen() {
    return PopupConfigManager.getConfig().enabledFullScreen ?? true;
  }

  public static isShowPopupToggle() {
    return PopupConfigManager.getConfig().showPopupToggle ?? true;
  }

  public static isShowQuickToggle() {
    return PopupConfigManager.getConfig().showQuickToggle ?? true;
  }
}

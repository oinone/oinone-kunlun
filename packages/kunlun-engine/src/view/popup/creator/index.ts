import { ObjectValue } from '@oinone/kunlun-request';
import { RuntimeAction, RuntimeViewAction } from '../../../runtime-metadata';
import { IStaticDialogWidget, IStaticDrawerWidget } from '../static-widget';
import { IPopupInstance } from '../typing';
import { Popup } from './popup';

/**
 * 弹窗控制器
 */
export class Dialog {
  public static readonly type = 'dialog';

  /**
   * 创建弹窗组件
   */
  public static create<T extends IStaticDialogWidget = IStaticDialogWidget>(): T {
    return Popup.create(Dialog.type);
  }

  /**
   * 通过跳转动作创建弹窗组件
   * @param action 跳转动作
   * @param extra 扩展参数
   */
  public static createByViewAction(action: RuntimeViewAction, extra?: ObjectValue) {
    return Popup.createByViewAction(Dialog.type, action, extra);
  }

  /**
   * 获取当前弹窗栈顶实例
   */
  public static peek(): IPopupInstance | undefined {
    return Popup.peek(Dialog.type);
  }

  /**
   * 获取当前弹窗激活实例
   */
  public static peekActive(): IPopupInstance | undefined {
    return Popup.peekActive(Dialog.type);
  }

  /**
   * 关闭当前弹窗激活实例
   */
  public static close(): boolean {
    return Popup.close(Dialog.type);
  }

  /**
   * 销毁当前弹窗激活实例
   */
  public static dispose<Action extends RuntimeAction = RuntimeAction>(triggerAction?: Action): boolean {
    return Popup.dispose(Dialog.type, triggerAction);
  }

  /**
   * 销毁全部弹窗实例
   */
  public static disposeAll(): void {
    Popup.disposeAll(Dialog.type);
  }
}

/**
 * 抽屉控制器
 */
export class Drawer {
  public static readonly type = 'drawer';

  /**
   * 创建抽屉组件
   */
  public static create<T extends IStaticDrawerWidget = IStaticDrawerWidget>(): T {
    return Popup.create(Drawer.type);
  }

  /**
   * 通过跳转动作创建抽屉组件
   * @param action 跳转动作
   * @param extra 扩展参数
   */
  public static createByViewAction(action: RuntimeViewAction, extra?: ObjectValue) {
    return Popup.createByViewAction(Drawer.type, action, extra);
  }

  /**
   * 获取当前抽屉栈顶实例
   */
  public static peek(): IPopupInstance | undefined {
    return Popup.peek(Drawer.type);
  }

  /**
   * 获取当前抽屉激活实例
   */
  public static peekActive(): IPopupInstance | undefined {
    return Popup.peekActive(Drawer.type);
  }

  /**
   * 关闭当前抽屉激活实例
   */
  public static close(): boolean {
    return Popup.close(Drawer.type);
  }

  /**
   * 销毁当前抽屉激活实例
   */
  public static dispose<Action extends RuntimeAction = RuntimeAction>(triggerAction?: Action): boolean {
    return Popup.dispose(Drawer.type, triggerAction);
  }

  /**
   * 销毁全部抽屉实例
   */
  public static disposeAll(): void {
    Popup.disposeAll(Drawer.type);
  }
}

export * from './spi';
export * from './popup';

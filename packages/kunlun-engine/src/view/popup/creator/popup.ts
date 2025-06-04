import { ObjectValue } from '@oinone/kunlun-request';
import { instantiate } from '@oinone/kunlun-shared';
import { RuntimeAction, RuntimeViewAction } from '../../../runtime-metadata';
import { PopupManager } from '../manager';
import { IPopupInstance, IPopupWidget, PopupType } from '../typing';
import { PopupConstructor, selectorPopupConstructor } from './spi';

let counter = 0;

/**
 * 弹出层控制器
 */
export class Popup {
  /**
   * 创建指定类型的弹出层组件
   * @param type 弹出层类型
   * @return 弹出层组件
   */
  public static create<T extends IPopupWidget = IPopupWidget>(type: PopupType): T {
    const constructor = selectorPopupConstructor({ type }) as PopupConstructor<T>;
    const newInstance = instantiate(constructor);
    let isInProxy = false;
    return new Proxy(newInstance, {
      get(target, p, receiver) {
        const opt = target.getOperator();
        if (!isInProxy && opt !== target) {
          isInProxy = true;
          const res = Reflect.get(opt, p, opt);
          isInProxy = false;
          return res;
        }
        return Reflect.get(target, p, receiver);
      },
      set(target, p, value, receiver) {
        const opt = target.getOperator();
        if (!isInProxy && opt !== target) {
          isInProxy = true;
          const res = Reflect.set(opt, p, value, opt);
          isInProxy = false;
          return res;
        }
        return Reflect.set(target, p, value, receiver);
      }
    });
  }

  /**
   * 通过跳转动作创建弹出层组件
   * @param type 弹出层类型
   * @param action 跳转动作
   * @param extra 扩展参数
   */
  public static createByViewAction(type: PopupType, action: RuntimeViewAction, extra?: ObjectValue): string {
    const popupInstanceKey = `oio-popup-${counter++}`;
    PopupManager.INSTANCE.push({
      type,
      key: popupInstanceKey,
      initialConfig: {
        action,
        extra
      }
    });
    return popupInstanceKey;
  }

  /**
   * 获取当前弹出层栈顶实例
   * @param type 弹出层类型
   */
  public static peek(type?: PopupType): IPopupInstance | undefined {
    return PopupManager.INSTANCE.peek(type);
  }

  /**
   * 获取当前弹出层激活实例
   * @param type 弹出层类型
   */
  public static peekActive(type?: PopupType): IPopupInstance | undefined {
    const instances = PopupManager.INSTANCE.getInstances(type);
    for (let i = instances.length - 1; i >= 0; i--) {
      const instance = instances[i];
      if (instance.widget?.isVisible) {
        return instance;
      }
    }
  }

  /**
   * 关闭当前弹出层激活实例
   * @param type 弹出层类型
   * @return 是否找到对应实例并执行关闭方法
   */
  public static close(type?: PopupType): boolean {
    return Popup.dispose(type);
  }

  /**
   * 销毁当前弹出层激活实例
   * @param type 弹出层实例
   * @return 是否找到对应实例并执行销毁方法
   */
  public static dispose<Action extends RuntimeAction = RuntimeAction>(
    type?: PopupType,
    triggerAction?: Action
  ): boolean {
    const instance = Popup.peekActive(type);
    if (instance) {
      PopupManager.INSTANCE.dispose(instance.key, triggerAction);
      return true;
    }
    return false;
  }

  /**
   * 销毁全部弹出层实例
   * @param type 弹出层类型
   */
  public static disposeAll(type?: PopupType): void {
    PopupManager.INSTANCE.disposeAll(type);
  }
}

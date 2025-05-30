import { ObjectValue } from '@kunlun/request';
import { RuntimeAction, RuntimeViewAction } from '../../runtime-metadata';
import { IWidget, WidgetProps } from '../widget';

/**
 * <h3>弹出层类型</h3>
 * <ul>
 *   <li>dialog: 弹框</li>
 *   <li>drawer: 抽屉</li>
 *   <li>其他未定义类型用于扩展</li>
 * </ul>
 */
export type PopupType = 'dialog' | 'drawer' | 'inner' | string;

/**
 * 弹出层实例
 */
export interface IPopupInstance<Props extends WidgetProps = WidgetProps> {
  /**
   * 弹出层实例类型
   */
  type: PopupType;

  /**
   * 唯一键
   */
  key: string;

  /**
   * 弹出层组件
   */
  widget?: IPopupWidget<Props> | null;

  /**
   * <h3>初始化配置</h3>
   * <p>任选其一进行初始化</p>
   * <p>手动创建的组件 > 跳转动作</p>
   */
  initialConfig: {
    /**
     * 手动创建弹出层组件
     */
    widget?: IPopupWidget<Props>;

    /**
     * 跳转动作
     */
    action?: RuntimeViewAction;

    /**
     * 弹窗扩展参数
     * */
    extra?: ObjectValue;
  };
}

/**
 * 弹出层组件
 */
export interface IPopupWidget<Props extends WidgetProps = WidgetProps> extends IWidget<Props> {
  /**
   * 是否为显示状态
   */
  get isVisible(): boolean;

  /**
   * 显示状态变化
   * @param visible 是否显示
   * @param triggerAction 触发该行为的动作
   */
  onVisibleChange<Action extends RuntimeAction = RuntimeAction>(visible: boolean, triggerAction?: Action): void;

  /**
   * 关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise
   * @param triggerAction 触发关闭行为的动作
   */
  beforeClose?: <Action extends RuntimeAction = RuntimeAction>(triggerAction?: Action) => boolean | Promise<boolean>;
}

/**
 * 弹出层管理器
 */
export interface IPopupManager {
  /**
   * <p>获取当前所有弹出层实例</p>
   * <p>当传入类型时, 将获取指定类型的所有弹出层实例</p>
   * @param type 指定类型
   */
  getInstances(type?: string): IPopupInstance[];

  /**
   * <p>获取栈顶弹出层实例</p>
   * <p>当传入类型时, 获取指定类型的栈顶弹出层实例</p>
   * @param type 指定类型
   */
  peek(type?: string): IPopupInstance | undefined;

  /**
   * 添加一个弹出层实例
   * @param instance 弹出层实例
   */
  push(instance: IPopupInstance);

  /**
   * 打开弹出层实例
   * @param key 唯一键
   */
  open(key: string): void;

  /**
   * 关闭弹出层实例
   * @param key 唯一键
   */
  close(key: string): void;

  /**
   * <p>销毁弹出层实例</p>
   * <p>当未传入唯一键时, 销毁栈顶弹出层实例</p>
   * <p>当传入唯一键时, 销毁指定弹出层实例</p>
   * @param key 唯一键
   */
  dispose(key?: string): void;

  /**
   * <p>销毁全部弹出层实例</p>
   * <p>当传入类型时, 将销毁指定类型的全部弹出层实例</p>
   * @param type 指定类型
   */
  disposeAll(type?: string): void;
}

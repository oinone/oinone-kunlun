import { Converter } from '@kunlun/shared';
import { RuntimeViewAction } from '../../runtime-metadata';

/**
 * 多标签页类型
 */
export enum MultiTabType {
  /**
   * 普通标签页
   */
  NORMAL,
  /**
   * 应用首页
   */
  HOMEPAGE,
  /**
   * 模块首页
   */
  MODULE_HOMEPAGE
}

/**
 * 标签页堆栈项
 */
export interface MultiTabStackItem {
  // /**
  //  * 跳转动作模型编码
  //  */
  // model?: string;

  // /**
  //  * 跳转动作名称
  //  */
  // name?: string;

  // /**
  //  * 获取跳转动作函数
  //  */
  // fetchAction?: Supplier<ReturnPromise<RuntimeViewAction>>;

  /**
   * 跳转动作
   */
  action: RuntimeViewAction;

  /**
   * 获取参数函数
   */
  generatorParameters?: Converter<RuntimeViewAction, Record<string, string | null | undefined>>;

  /**
   * 跳转参数
   */
  parameters?: Record<string, string | null | undefined>;
}

/**
 * 标签页实例
 */
export interface MultiTabInstance {
  /**
   * 标签页类型
   */
  type: MultiTabType;

  /**
   * 唯一键
   */
  key: string;

  /**
   * 标签页组件
   */
  widget: MultiTabWidget | null;

  /**
   * 标签页堆栈
   */
  stack: MultiTabStackItem[];

  /**
   * 当前标签页堆栈索引（暂未使用）
   */
  index: number;

  /**
   * 标签页标题
   */
  title?: string;

  /**
   * 标签页Logo链接
   */
  logoUrl?: string;

  /**
   * 标签页Logo图标
   */
  logoIcon?: string;

  /**
   * 唯一键字符串
   */
  pkString?: string;
}

/**
 * 标签页组件
 * @param Component 实例化组件类型
 */
export interface MultiTabWidget<Component = unknown> {
  /**
   * 获取当前handle
   */
  getCurrentHandle(): string;

  /**
   * 获取标签页组件
   * @param isBuild 不存在时自动构建
   */
  getWidgetComponent(isBuild: boolean): Component | undefined;

  /**
   * 激活时调用方法
   * @param lastedInstance 上一个激活的标签页实例
   */
  onActive?(lastedInstance: MultiTabInstance | undefined);

  /**
   * 关闭时调用方法
   */
  onClose?();

  /**
   * 刷新时调用方法
   * @param args 任意入参, 实现时自行约定实现
   */
  onRefresh?(...args: unknown[]);
}

/**
 * 多标签页管理器
 */
export interface IMultiTabsManager {
  /**
   * 获取当前所有标签页实例
   */
  getTabs(): MultiTabInstance[];

  /**
   * 添加一个标签页
   * @param instance 标签页实例
   */
  push(instance: MultiTabInstance);

  /**
   * 激活指定标签页
   * @param key 唯一键
   */
  active(key: string);

  /**
   * 关闭指定标签页
   * @param key 唯一键
   */
  close(key: string);

  /**
   * 刷新指定标签页
   * @param key 唯一键
   * @param args 任意入参, 实现时自行约定实现
   */
  refresh(key: string, ...args: unknown[]);
}

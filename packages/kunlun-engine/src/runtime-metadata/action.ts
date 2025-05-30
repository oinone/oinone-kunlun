import { ActionType, ViewActionTarget, ViewMode, ViewType } from '@kunlun/meta';
import { RuntimeAction, RuntimeModel, RuntimeModule } from './base';
import { RuntimeFunctionDefinition } from './function';
import { RuntimeLayoutDefinition } from './layout';
import { RuntimeMaskDefinition } from './mask';
import { RuntimeView } from './view';

/**
 * 运行时跳转动作
 */
export interface RuntimeViewAction extends RuntimeAction {
  /**
   * 跳转动作标题
   */
  title?: string;
  /**
   * 跳转类型
   */
  target: ViewActionTarget;
  /**
   * 不可视过滤条件
   */
  filter?: string;
  /**
   * 可视过滤条件
   */
  domain?: string;
  /**
   * 当前模块编码
   */
  module?: string;
  /**
   * 当前模块名称
   */
  moduleName: string;
  /**
   * 当前模块定义
   */
  moduleDefinition?: RuntimeModule;
  /**
   * 母版定义
   */
  maskDefinition?: RuntimeMaskDefinition;
  /**
   * 当前视图布局定义
   */
  viewLayout?: RuntimeLayoutDefinition;
  /**
   * 当前视图名称
   */
  viewName?: string;
  /**
   * 当前视图类型
   */
  viewType?: ViewType;
  /**
   * 当前视图模式
   */
  viewMode?: ViewMode;

  /**
   * 目标模型编码
   */
  resModel: string;
  /**
   * 目标模型名称
   */
  resModelName: string;
  /**
   * 目标模型定义
   */
  resModelDefinition?: RuntimeModel;
  /**
   * 目标模块编码
   */
  resModule?: string;
  /**
   * 目标模块名称
   */
  resModuleName?: string;
  /**
   * 目标模块定义
   */
  resModuleDefinition?: RuntimeModule;
  /**
   * 母版定义
   */
  resMaskDefinition?: RuntimeMaskDefinition;
  /**
   * 目标视图布局定义
   */
  resViewLayout?: RuntimeLayoutDefinition;
  /**
   * 目标视图名称
   */
  resViewName?: string;
  /**
   * 目标视图类型
   */
  resViewType: ViewType;
  /**
   * 目标视图模式
   */
  resViewMode: ViewMode;
  /**
   * 目标视图定义
   */
  resView?: RuntimeView;
  /**
   * 主题
   */
  theme?: string;
  /**
   * 加载函数名称
   */
  load?: string;
  /**
   * 加载函数定义
   */
  loadFunctionDefinition?: RuntimeFunctionDefinition;
}

export interface SharedRuntimeViewAction extends RuntimeViewAction {
  /**
   * 分享码
   */
  sharedCode: string;
  /**
   * 授权码
   */
  authorizationCode: string;
  /**
   * 分享参数
   */
  sharedParameters: Record<string, unknown>;
  /**
   * 浏览器标题
   */
  browserTitle?: string;
  /**
   * 当前语言
   */
  language?: string;
  /**
   * 当前语言ISO编码
   */
  languageIsoCode?: string;
}

/**
 * 运行时服务器动作
 */
export interface RuntimeServerAction extends RuntimeAction {
  /**
   * 函数名称
   */
  fun?: string;
  /**
   * 函数定义
   */
  functionDefinition?: RuntimeFunctionDefinition;
}

/**
 * 运行时链接动作
 */
export interface RuntimeUrlAction extends RuntimeAction {
  /**
   * 跳转url
   */
  url?: string;
  /**
   * 打开方式
   */
  target?: ViewActionTarget;
  /**
   * 计算函数
   */
  computeFunction?: RuntimeFunctionDefinition;
  /**
   * 计算函数Fun
   */
  compute?: string;
}

/**
 * 运行时客户端动作
 */
export interface RuntimeClientAction extends RuntimeAction {
  /**
   * 客户端动作名
   */
  fun: string;
}

/**
 * 运行时组合动作
 */
export interface RuntimeCompositionAction extends RuntimeAction {
  /**
   * 动作组
   */
  actions: RuntimeAction[];
}

export function isRuntimeServerAction(action: RuntimeAction | undefined): action is RuntimeServerAction {
  return action?.actionType === ActionType.Server;
}

export function isRuntimeViewAction(action: RuntimeAction | undefined): action is RuntimeViewAction {
  return action?.actionType === ActionType.View;
}

export function isRuntimeUrlAction(action: RuntimeAction | undefined): action is RuntimeUrlAction {
  return action?.actionType === ActionType.URL;
}

export function isRuntimeClientAction(action: RuntimeAction | undefined): action is RuntimeClientAction {
  return action?.actionType === ActionType.Client;
}

export function isRuntimeCompositionAction(action: RuntimeAction | undefined): action is RuntimeCompositionAction {
  return action?.actionType === ActionType.Composition;
}

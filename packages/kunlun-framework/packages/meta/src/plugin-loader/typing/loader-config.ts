import { CSSPlugin, JavascriptPlugin, PluginLoadType } from './load-option';

/**
 * 插件加载依赖
 */
export type PluginLoadDependency = {
  /**
   * 插件加载类型
   */
  type: PluginLoadType;
  /**
   * 依赖项
   */
  dependencies: Record<string, unknown>;
};

/**
 * 插件加载依赖
 */
export type PluginLoadDependencies = Record<string, unknown> | PluginLoadDependency[];

/**
 * 插件加载配置
 */
export interface PluginsLoaderConfig {
  /**
   * 动态指定依赖（未实现）
   */
  dependencies?: PluginLoadDependencies;
  /**
   * 挂载指定外部js和css；数组默认使用js加载
   */
  mounted?: JavascriptPlugin[] | { js?: JavascriptPlugin[]; css?: CSSPlugin[] };
  /**
   * 使用低无一体组件；默认为false
   */
  usingRemote?: boolean;
}

/**
 * 插件加载类型
 */
export type PluginLoadType = 'esm' | 'cjs' | 'umd' | 'iife' | 'css';

/**
 * Javascript插件
 * default type: umd
 */
export type JavascriptPlugin = string | { type: PluginLoadType; path: string };

/**
 * CSS插件
 * type: css
 */
export type CSSPlugin = string;

/**
 * key: module
 * value: global name or module
 */
type PluginLoadDependencies = Record<string, unknown>;

export interface PluginLoadOption {
  id: string;
  type: PluginLoadType;
  path: string;
  dependencies?: PluginLoadDependencies;
}

export interface RemoteLoadOption {
  javascript?: JavascriptPlugin[];
  css?: CSSPlugin[];
}

/**
 * 加载器
 */
export interface PluginLoader {
  /**
   * 通过加载可选项进行加载
   * @param option
   */
  load(option: PluginLoadOption): Promise<void>;

  /**
   * 依赖加载
   * @param dependencies 加载依赖
   */
  loadDependencies(dependencies: PluginLoadDependencies): Promise<void>;
}

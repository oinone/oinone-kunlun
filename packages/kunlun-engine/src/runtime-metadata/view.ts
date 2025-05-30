import { DslDefinition } from '@kunlun/dsl';
import { ViewType } from '@kunlun/meta';
import { BaseRuntimeModelMetadata } from './base';

/**
 * <h3>运行时视图</h3>
 * <p>
 * 支持两种渲染模式
 * </p>
 * - layout和dsl根据slot定义合并生成template渲染
 * - 直接渲染template
 */
export interface RuntimeView extends BaseRuntimeModelMetadata {
  /**
   * 视图名称
   */
  name?: string;
  /**
   * 视图标题
   */
  title?: string;
  /**
   * 视图类型
   */
  type: ViewType;
  /**
   * 视图模块编码
   */
  module?: string;
  /**
   * 视图模块名称
   */
  moduleName?: string;
  /**
   * 布局名称
   */
  layoutName?: string;
  /**
   * 布局dsl
   */
  layout?: string | DslDefinition;
  /**
   * 模板dsl
   */
  dsl?: string | DslDefinition;
  /**
   * 最终执行dsl
   */
  template?: string | DslDefinition;
  /**
   * 不可视过滤条件
   */
  filter?: string;
  /**
   * 可视过滤条件
   */
  domain?: string;
  /**
   * 视图初始值
   */
  initialValue?: Record<string, unknown>[];
  /**
   * 上下文
   */
  context?: Record<string, unknown>;
  /**
   * 扩展属性
   */
  extension?: Record<string, unknown>;
}

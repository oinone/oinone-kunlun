import { ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { Condition, ILevel } from '@oinone/kunlun-request';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPIOptions } from '@oinone/kunlun-spi';

export interface QueryExpression {
  leftValue: string[];
  operator: string;
  right: unknown;
}

export const URL_SPLIT_SEPARATOR = ',';

export interface UrlQueryParameters extends Record<string, string | null | undefined> {
  id?: string | null;
  ids?: string | null;
  /**
   * 模块名称; 实际为moduleName
   */
  module?: string;
  /**
   * 视图类型
   */
  viewType?: ViewType;
  /**
   * 模型编码
   */
  model?: string;
  /**
   * 动作名称
   */
  action?: string;
  /**
   * 默认为动作名称
   */
  scene?: string;
  /**
   * 跳转类型
   */
  target?: ViewActionTarget;

  /**
   * 分页参数 - 当前页数
   */
  currentPage?: string;
  /**
   * 分页参数 - 单页数量
   */
  pageSize?: string;

  /**
   * 排序参数 - 排序字段 使用{@link URL_SPLIT_SEPARATOR}分割
   */
  sortField?: string | null;
  /**
   * 排序参数 - 排序方向 使用{@link URL_SPLIT_SEPARATOR}分割
   */
  direction?: string | null;

  context?: string | null;

  /**
   * 搜索区域展开
   */
  expand?: string | null;

  searchBody?: string | null;
  searchConditions?: string | null;
}

export type RefreshProcessFunction = (condition?: Condition) => ReturnPromise<void>;

export interface FormValidateResult {
  level: ILevel;
  path: string;
  message?: string;
}

export interface MobileSPIOptions extends SPIOptions {
  platform?: 'mobile';
}

import { DslDefinition, XMLParse } from '@oinone/kunlun-dsl';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPIFactory, SPIOperator, SPIOptions, SPISingleSelector, SPITokenFactory } from '@oinone/kunlun-spi';

/**
 * 布局注册可选项
 */
export interface LayoutRegisterOptions extends SPIOptions {
  // region view

  /**
   * 视图类型
   */
  viewType: ViewType | ViewType[];
  /**
   * 视图模型所在模块编码，一般是下划线风格的英文 designer_common
   */
  module?: string | string[];
  /**
   * 视图模型所在模块名称，一般是驼峰风格的英文 designerCommon
   */
  moduleName?: string | string[];
  /**
   * 布局名称，对应 viewActionQuery.load.resView.baseLayoutName
   */
  layoutName?: string | string[];
  /**
   * 视图的模型编码
   */
  model?: string | string[];
  /**
   * 视图的模型名称
   */
  modelName?: string | string[];
  /**
   * 视图的名称
   */
  viewName?: string | string[];
  /**
   * 是否为内嵌视图(子视图特有)，表单页内有个o2m的子表格，该表格的inline为true
   */
  inline?: boolean;

  // endregion

  // region field

  /**
   * 模型字段类型(子视图特有)
   */
  ttype?: ModelFieldType | ModelFieldType[];
  /**
   * 关联模型字段类型(子视图特有)
   */
  relatedTtype?: ModelFieldType | ModelFieldType[];
  /**
   * 字段(子视图特有)
   */
  field?: string | string[];

  // endregion

  // region action

  /**
   * 动作名称
   */
  actionName?: string | string[];
  /**
   * 动作使用的组件名称
   */
  actionWidget?: string | string[];

  // endregion
}

@SPIFactory.Storage<string, LayoutRegisterOptions>(
  [
    'viewType',
    'module',
    'moduleName',
    'layoutName',
    'model',
    'modelName',
    'viewName',
    'inline',

    'ttype',
    'relatedTtype',
    'field',

    'actionName',
    'actionWidget'
  ],
  { key: Symbol('LayoutTpl') }
)
export class LayoutManager {
  private static Token: SPITokenFactory<LayoutRegisterOptions>;

  private static Selector: SPISingleSelector<LayoutRegisterOptions, string>;

  public static register(options: LayoutRegisterOptions, template: string): boolean {
    const token = LayoutManager.Token(options);
    if (token) {
      return SPIOperator.register(token.key, token.options, template);
    }
    return false;
  }

  public static selector(options: LayoutRegisterOptions): DslDefinition | undefined {
    const result = LayoutManager.Selector(options);
    if (result) {
      return XMLParse.INSTANCE.parse(result);
    }
  }
}

/**
 * @deprecated please use {@link LayoutRegisterOptions}
 */
export type ILayoutOption = LayoutRegisterOptions;

export function registerLayout(layoutTpl: string, layoutOption: LayoutRegisterOptions): boolean {
  if (!layoutOption.viewType) {
    console.warn('viewType is blank');
    return false;
  }
  if (!layoutTpl) {
    console.warn('layoutTpl is blank');
    return false;
  }
  return LayoutManager.register(layoutOption, layoutTpl);
}

export function generatorLayout(layoutOption: LayoutRegisterOptions): DslDefinition | undefined {
  return LayoutManager.selector(layoutOption);
}

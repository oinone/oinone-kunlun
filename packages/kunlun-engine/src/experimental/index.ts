import { RuntimeConfig, RuntimeConfigOptions } from '@oinone/kunlun-meta';

/**
 * 实验性配置
 */
export interface ExperimentalConfig extends RuntimeConfigOptions {
  /**
   * buildQueryCondition方法版本；目前仅有next和非next两个版本；
   */
  buildQueryCondition?: string;
  /**
   * AddressWidget 组件版本；目前仅有next和非next两个版本；
   */
  AddressWidget?: string;
  /**
   * BaseElementViewWidget 组件版本；目前仅有next和非next两个版本；
   */
  BaseElementViewWidget?: string;
  /**
   * TreeWidget 组件版本；目前仅有next和非next两个版本；
   */
  TreeWidget?: string;
  /**
   * 当多对一是既是存储字段也是关联关系存储时，是否提交当前字段进行存储；目前仅有next和非next两个版本；
   */
  submitM2OStoreField?: string;
}

export class ExperimentalConfigManager {
  public static getConfig(): ExperimentalConfig {
    return RuntimeConfig.getConfig<ExperimentalConfig>('experimental') || {};
  }

  public static buildQueryConditionNext(): boolean {
    const version = ExperimentalConfigManager.getConfig().buildQueryCondition || process.env.BUILD_QUERY_CONDITION;
    return version === 'next';
  }

  public static addressWidgetNext(): boolean {
    const version = ExperimentalConfigManager.getConfig().AddressWidget || process.env.ADDRESS_WIDGET;
    return version === 'next';
  }

  public static baseElementViewWidgetNext(): boolean {
    const version = ExperimentalConfigManager.getConfig().BaseElementViewWidget || process.env.BASE_ELEMENT_VIEW_WIDGET;
    return version === 'next';
  }

  public static treeWidgetNext(): boolean {
    const version = ExperimentalConfigManager.getConfig().TreeWidget || process.env.TREE_WIDGET;
    return version === 'next';
  }

  public static submitM2OStoreFieldNext(): boolean {
    const version = ExperimentalConfigManager.getConfig().submitM2OStoreField || process.env.SUBMIT_M2O_STORE_FIELD;
    return version === 'next';
  }
}

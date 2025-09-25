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
}

export class ExperimentalConfigManager {
  public static getConfig(): ExperimentalConfig {
    return RuntimeConfig.getConfig<ExperimentalConfig>('experimental') || {};
  }

  public static buildQueryConditionNext(): boolean {
    const version = process.env.BUILD_QUERY_CONDITION || ExperimentalConfigManager.getConfig().buildQueryCondition;
    return version === 'next';
  }

  public static addressWidgetNext(): boolean {
    const version = process.env.ADDRESS_WIDGET || ExperimentalConfigManager.getConfig().AddressWidget;
    return version === 'next';
  }

  public static baseElementViewWidgetNext(): boolean {
    const version = process.env.BASE_ELEMENT_VIEW_WIDGET || ExperimentalConfigManager.getConfig().BaseElementViewWidget;
    return version === 'next';
  }

  public static treeWidgetNext(): boolean {
    const version = process.env.TREE_WIDGET || ExperimentalConfigManager.getConfig().TreeWidget;
    return version === 'next';
  }
}

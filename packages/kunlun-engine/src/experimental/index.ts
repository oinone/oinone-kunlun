import { RuntimeConfig } from '@oinone/kunlun-meta';
import { ExperimentalConfig } from './config';

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

export * from './config';

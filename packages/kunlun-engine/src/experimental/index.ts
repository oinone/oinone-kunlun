import { RuntimeConfig } from '@kunlun/meta';
import { ExperimentalConfig } from './config';

export class ExperimentalConfigManager {
  public static getConfig(): ExperimentalConfig {
    return RuntimeConfig.getConfig<ExperimentalConfig>('experimental') || {};
  }

  public static buildQueryConditionNext(): boolean {
    const version = process.env.BUILD_QUERY_CONDITION || ExperimentalConfigManager.getConfig().buildQueryCondition;
    return version === 'next';
  }
}

export * from './config';

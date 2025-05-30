import { RuntimeConfig } from '@kunlun/meta';
import { StringHelper } from '@kunlun/shared';
import { ConfigHelper } from '../../config';
import { getSystemMajorConfig } from '../../provider/major';
import { MajorConfig } from '../../provider/typing';
import { MultiTabsApplicationHomepageConfig, MultiTabsConfig, MultiTabsModuleHomepageConfig } from './config';

export class MultiTabsRuntimeManifestMergedConfigManager {
  private constructor() {
    // reject create object
  }

  protected static runtimeManifestMergedConfigCache: MultiTabsConfig | undefined = undefined;

  public static refreshConfig(config: MajorConfig): MultiTabsConfig {
    const newConfig = ConfigHelper.getConfig(
      MultiTabsRuntimeManifestMergedConfigManager.runtimeManifestMergedConfigCache
    );
    Object.assign(newConfig, config.multiTabTheme);
    Object.assign(newConfig, config.extend?.systemStyleConfig?.multiTabConfig);
    MultiTabsRuntimeManifestMergedConfigManager.runtimeManifestMergedConfigCache = newConfig;

    return newConfig;
  }

  public static getConfig(): MultiTabsConfig {
    if (MultiTabsRuntimeManifestMergedConfigManager.runtimeManifestMergedConfigCache) {
      return MultiTabsRuntimeManifestMergedConfigManager.runtimeManifestMergedConfigCache;
    }

    const config = ConfigHelper.getConfig(RuntimeConfig.getConfig('multiTabs'));
    const systemMajorConfig = getSystemMajorConfig();
    Object.assign(config, systemMajorConfig.multiTabTheme);
    Object.assign(config, systemMajorConfig.extend?.systemStyleConfig?.multiTabConfig);
    MultiTabsRuntimeManifestMergedConfigManager.runtimeManifestMergedConfigCache = config;

    return config;
  }

  public static getApplicationHomepageConfig(): MultiTabsApplicationHomepageConfig {
    return ConfigHelper.getConfig(MultiTabsRuntimeManifestMergedConfigManager.getConfig().homepage);
  }

  public static getModuleHomepageConfig(): MultiTabsModuleHomepageConfig {
    return ConfigHelper.getConfig(MultiTabsRuntimeManifestMergedConfigManager.getConfig().moduleHomepage);
  }

  public static isEnabled(module?: string): boolean {
    let { enabled } = MultiTabsRuntimeManifestMergedConfigManager.getConfig();
    if (enabled == null) {
      enabled = true;
    }
    if (enabled && module) {
      return !MultiTabsConfigManager.getFilter().includes(module);
    }
    return enabled;
  }

  public static isInline(): boolean {
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabledModuleHomepage()) {
      return true;
    }
    return ConfigHelper.getBoolean(MultiTabsRuntimeManifestMergedConfigManager.getConfig().inline);
  }

  public static isShowModuleLogo(): boolean {
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabledModuleHomepage()) {
      return false;
    }
    return ConfigHelper.getBoolean(MultiTabsRuntimeManifestMergedConfigManager.getConfig().showModuleLogo, true);
  }

  public static getMaxCount(): number | undefined {
    return ConfigHelper.getNumberNullable(MultiTabsRuntimeManifestMergedConfigManager.getConfig().maxCount);
  }

  public static getMaxCacheCount(): number {
    return ConfigHelper.getNumber(MultiTabsRuntimeManifestMergedConfigManager.getConfig().maxCacheCount, 10);
  }

  public static isEnabledHomepage(): boolean {
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabledModuleHomepage()) {
      return false;
    }
    return ConfigHelper.getBoolean(
      MultiTabsRuntimeManifestMergedConfigManager.getApplicationHomepageConfig().enabled,
      true
    );
  }

  public static isEnabledModuleHomepage(): boolean {
    return ConfigHelper.getBoolean(MultiTabsRuntimeManifestMergedConfigManager.getModuleHomepageConfig().enabled);
  }
}

export class MultiTabsConfigManager {
  private constructor() {
    // reject create object
  }

  public static getConfig(): MultiTabsConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('multiTabs'));
  }

  public static getApplicationHomepageConfig(): MultiTabsApplicationHomepageConfig {
    return ConfigHelper.getConfig(MultiTabsConfigManager.getConfig().homepage);
  }

  public static getModuleHomepageConfig(): MultiTabsModuleHomepageConfig {
    return ConfigHelper.getConfig(MultiTabsConfigManager.getConfig().moduleHomepage);
  }

  public static isEnabled(module?: string): boolean {
    let { enabled } = MultiTabsConfigManager.getConfig();
    if (enabled == null) {
      enabled = true;
    }
    if (enabled && module) {
      return !MultiTabsConfigManager.getFilter().includes(module);
    }
    return enabled;
  }

  public static isInline(): boolean {
    if (MultiTabsConfigManager.isEnabledModuleHomepage()) {
      return true;
    }
    return ConfigHelper.getBoolean(MultiTabsConfigManager.getConfig().inline);
  }

  public static isShowModuleLogo(): boolean {
    if (MultiTabsConfigManager.isEnabledModuleHomepage()) {
      return false;
    }
    return ConfigHelper.getBoolean(MultiTabsConfigManager.getConfig().showModuleLogo, true);
  }

  public static getMaxCount(): number | undefined {
    return ConfigHelper.getNumberNullable(MultiTabsConfigManager.getConfig().maxCount);
  }

  public static getMaxCacheCount(): number {
    return ConfigHelper.getNumber(MultiTabsConfigManager.getConfig().maxCacheCount, 10);
  }

  public static isEnabledHomepage(): boolean {
    if (MultiTabsConfigManager.isEnabledModuleHomepage()) {
      return false;
    }
    return ConfigHelper.getBoolean(MultiTabsConfigManager.getApplicationHomepageConfig().enabled, true);
  }

  public static isEnabledModuleHomepage(): boolean {
    return ConfigHelper.getBoolean(MultiTabsConfigManager.getModuleHomepageConfig().enabled);
  }

  public static getInternalFilter(): string[] {
    return [
      'dataDesigner',
      'uiDesigner',
      'printDesigner',
      'modelDesigner',
      'logicDesigner',
      'workflowDesigner',
      'eipDesigner',
      'dataflowDesigner',
      'datavi'
    ];
  }

  public static getFilter(): string[] {
    const { filter } = MultiTabsConfigManager.getConfig();
    return [...new Set(StringHelper.append(MultiTabsConfigManager.getInternalFilter(), filter))];
  }
}

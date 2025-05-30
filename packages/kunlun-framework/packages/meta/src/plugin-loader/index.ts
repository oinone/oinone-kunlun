import { RemotePluginLoader } from './loader/RemotePluginLoader';
import { PluginLoadDependencies, PluginsLoaderConfig } from './typing';
import { PluginLoadHelper } from './util';

export class PluginsLoader {
  public static async load(config: PluginsLoaderConfig, localDependencies?: PluginLoadDependencies): Promise<void> {
    const { dependencies: dynamicDependencies, mounted, usingRemote } = config;
    if (localDependencies) {
      await PluginLoadHelper.loadDependencies(localDependencies);
    }
    if (dynamicDependencies) {
      await PluginLoadHelper.loadDependencies(dynamicDependencies);
    }
    if (mounted) {
      if (Array.isArray(mounted)) {
        await PluginLoadHelper.loadJavascript(mounted);
      } else {
        const { js, css } = mounted;
        if (js) {
          await PluginLoadHelper.loadJavascript(js);
        }
        if (css) {
          await PluginLoadHelper.loadCSS(css);
        }
      }
    }
    if (usingRemote) {
      await RemotePluginLoader.INSTANCE.load();
    }
  }
}

export * from './typing';

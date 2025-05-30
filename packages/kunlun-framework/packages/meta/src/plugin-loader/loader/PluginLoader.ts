import { PluginLoaderFactory } from '../factory';
import { PluginLoadOption, PluginLoadType } from '../typing';

export class PluginLoader {
  public static async load(options: PluginLoadOption[]): Promise<void> {
    await Promise.allSettled(options.map((option) => PluginLoaderFactory.get(option.type)?.load(option)));
  }

  public static async loadDependencies(type: PluginLoadType, dependencies: Record<string, unknown>): Promise<void> {
    await PluginLoaderFactory.get(type)?.loadDependencies(dependencies);
  }
}

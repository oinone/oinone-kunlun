import { PluginLoader, PluginLoadOption } from '../typing';
import { ESMPluginLoader } from './ESMPluginLoader';

export class CJSPluginLoader implements PluginLoader {
  public static readonly INSTANCE = new CJSPluginLoader();

  private constructor() {
    // reject create object
  }

  public load(option: PluginLoadOption) {
    return ESMPluginLoader.INSTANCE.load(option);
  }

  public loadDependencies(dependencies: Record<string, unknown>) {
    return ESMPluginLoader.INSTANCE.loadDependencies(dependencies);
  }
}

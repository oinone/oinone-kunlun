import { PluginLoader, PluginLoadOption } from '../typing';
import { UMDPluginLoader } from './UMDPluginLoader';

export class IIFEPluginLoader implements PluginLoader {
  public static readonly INSTANCE = new IIFEPluginLoader();

  private constructor() {
    // reject create object
  }

  public load(option: PluginLoadOption) {
    return UMDPluginLoader.INSTANCE.load(option);
  }

  public loadDependencies(dependencies: Record<string, unknown>) {
    return UMDPluginLoader.INSTANCE.loadDependencies(dependencies);
  }
}

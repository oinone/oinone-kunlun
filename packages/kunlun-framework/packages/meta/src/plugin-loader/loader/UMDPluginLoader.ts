import { PluginLoader, PluginLoadOption } from '../typing';
import { bindScriptLoadedEvent } from './LoadedEvent';

export class UMDPluginLoader implements PluginLoader {
  public static readonly INSTANCE = new UMDPluginLoader();

  public async load(option: PluginLoadOption): Promise<void> {
    const { id, path, dependencies } = option;
    const element = document.getElementById(id);
    if (element) {
      return;
    }
    if (dependencies) {
      await this.loadDependencies(dependencies);
    }
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = path;
      script.type = 'text/javascript';
      bindScriptLoadedEvent(script, resolve);
      document.body.append(script);
    });
  }

  public async loadDependencies(dependencies: Record<string, unknown>): Promise<void> {
    if (!dependencies) {
      return;
    }
    const global = window as unknown as Record<string, unknown>;
    await Promise.allSettled(
      Object.entries(dependencies).map(async ([key, value]) => {
        if (global[key] === undefined) {
          let mountModule: unknown | null | undefined;
          if (typeof value === 'string') {
            mountModule = await import(value);
          } else {
            mountModule = await value;
          }
          if (!mountModule) {
            mountModule = null;
          }
          if (global[key] === undefined) {
            global[key] = mountModule;
          }
        }
      })
    );
  }
}

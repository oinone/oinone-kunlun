import { PluginLoader, PluginLoadOption } from '../typing';
import { bindScriptLoadedEvent } from './LoadedEvent';

let counter = 0;

export class ESMPluginLoader implements PluginLoader {
  public static readonly INSTANCE = new ESMPluginLoader();

  private constructor() {
    // reject create object
  }

  public async load(option: PluginLoadOption): Promise<void> {
    const { id, path, dependencies } = option;
    const element = document.getElementById(id);
    if (element) {
      return;
    }
    if (dependencies) {
      await this.loadDependencies(dependencies);
    }
    return new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = path;
      script.type = 'module';
      bindScriptLoadedEvent(script, resolve);
      document.body.append(script);
    });
  }

  public async loadDependencies(dependencies: Record<string, unknown>): Promise<void> {
    const importMap: Record<string, string> = {};
    Object.entries(dependencies).forEach(([key, value]) => {
      if (typeof value === 'string') {
        importMap[key] = value;
      }
    });
    if (!Object.keys(importMap).length) {
      return;
    }
    return new Promise((resolve) => {
      const importMapScript = document.createElement('script');
      importMapScript.id = `import-map-${counter++}`;
      importMapScript.type = 'importmap';
      importMapScript.text = JSON.stringify({
        imports: importMap
      });
      bindScriptLoadedEvent(importMapScript, resolve);
      document.body.append(importMapScript);
    });
  }
}

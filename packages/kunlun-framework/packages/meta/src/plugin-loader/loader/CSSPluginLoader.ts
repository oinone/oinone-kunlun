import { PluginLoader, PluginLoadOption } from '../typing';
import { bindLinkLoadedEvent } from './LoadedEvent';

export class CSSPluginLoader implements PluginLoader {
  public static readonly INSTANCE = new CSSPluginLoader();

  private constructor() {
    // reject create object
  }

  public async load(option: PluginLoadOption): Promise<void> {
    const { id, path } = option;
    const element = document.getElementById(id);
    if (element) {
      return;
    }
    return new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.id = id;
      link.href = path;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      bindLinkLoadedEvent(link, resolve);
      document.body.append(link);
    });
  }

  public async loadDependencies(): Promise<void> {}
}

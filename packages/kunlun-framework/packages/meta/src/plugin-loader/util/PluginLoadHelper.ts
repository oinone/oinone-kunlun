import { PluginLoader as InternalPluginLoader } from '../loader';
import { CSSPlugin, JavascriptPlugin, PluginLoadDependencies, PluginLoadDependency, PluginLoadOption } from '../typing';

let counter = 1;

function isPluginLoadOption(plugin: unknown): plugin is PluginLoadOption {
  return !!plugin;
}

export class PluginLoadHelper {
  private constructor() {
    // reject create object
  }

  public static async loadDependencies(dependencies: PluginLoadDependencies): Promise<void> {
    let readyLoadDependencies: PluginLoadDependency[];
    if (Array.isArray(dependencies)) {
      readyLoadDependencies = dependencies;
    } else {
      readyLoadDependencies = [
        {
          type: 'umd',
          dependencies
        }
      ];
    }
    await Promise.allSettled(
      readyLoadDependencies.map((dependency) =>
        InternalPluginLoader.loadDependencies(dependency.type, dependency.dependencies)
      )
    );
  }

  public static loadJavascript(plugins: JavascriptPlugin[]): Promise<void> {
    return InternalPluginLoader.load(
      plugins
        .map((plugin): PluginLoadOption | undefined => {
          if (typeof plugin === 'string') {
            return {
              id: `plugin-${counter++}`,
              type: 'umd',
              path: plugin
            };
          }
          if (plugin.path) {
            return {
              id: `plugin-${counter++}`,
              type: plugin.type || 'umd',
              path: plugin.path
            };
          }
          console.error('Invalid javascript plugin.', plugin);
          return undefined;
        })
        .filter(isPluginLoadOption)
    );
  }

  public static loadCSS(paths: CSSPlugin[]): Promise<void> {
    return InternalPluginLoader.load(
      paths.map((path): PluginLoadOption => {
        return {
          id: `plugin-css-${counter++}`,
          type: 'css',
          path
        };
      })
    );
  }
}

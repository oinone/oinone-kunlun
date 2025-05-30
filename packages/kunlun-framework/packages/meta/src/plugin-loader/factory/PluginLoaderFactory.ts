import { CJSPluginLoader } from '../loader/CJSPluginLoader';
import { CSSPluginLoader } from '../loader/CSSPluginLoader';
import { ESMPluginLoader } from '../loader/ESMPluginLoader';
import { IIFEPluginLoader } from '../loader/IIFEPluginLoader';
import { UMDPluginLoader } from '../loader/UMDPluginLoader';
import { PluginLoader, PluginLoadType } from '../typing';

export class PluginLoaderFactory {
  public static get(type: PluginLoadType): PluginLoader | undefined {
    switch (type) {
      case 'esm':
        return ESMPluginLoader.INSTANCE;
      case 'cjs':
        return CJSPluginLoader.INSTANCE;
      case 'umd':
        return UMDPluginLoader.INSTANCE;
      case 'iife':
        return IIFEPluginLoader.INSTANCE;
      case 'css':
        return CSSPluginLoader.INSTANCE;
    }
  }
}

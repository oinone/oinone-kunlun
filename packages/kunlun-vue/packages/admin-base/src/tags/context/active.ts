import { LayoutRegisterOptions } from '../../spi';

interface RegisterOptionsMap {
  Layout: LayoutRegisterOptions;
}

type OptionKeys = keyof RegisterOptionsMap;

export class ActiveLayoutEffectOpt {
  private static optionsMap: Map<OptionKeys, RegisterOptionsMap[OptionKeys]> = new Map();

  public static setOption<K extends OptionKeys>(key: K, option: RegisterOptionsMap[K]): void {
    this.optionsMap.set(key, option);
  }

  public static getOption<K extends OptionKeys>(key?: K): RegisterOptionsMap[K] | undefined {
    return this.optionsMap.get(key || 'Layout') as RegisterOptionsMap[K];
  }
}

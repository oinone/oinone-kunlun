import { uniqueKeyGenerator } from '@kunlun/shared';
import { SPIMatchKeys, SPIOptions } from '../typing';
import { SPIOperator } from './operator';
import { StorageKey } from './storage';

export type SPISingleSelector<O extends SPIOptions, V = unknown> = (options: O) => V | undefined;

export type SPISingleSelectorNoOptions<V = unknown> = () => V | undefined;

export type SPIMultiSelector<O extends SPIOptions, V = unknown> = (options: O) => V[];

export type SPIMultiSelectorNoOptions<V = unknown> = () => V[];

export type SPISelector<O extends SPIOptions, V = unknown> =
  | SPISingleSelector<O, V>
  | SPISingleSelectorNoOptions<V>
  | SPIMultiSelector<O, V>
  | SPIMultiSelectorNoOptions<V>;

export interface SPIToken<O extends SPIOptions = SPIOptions> {
  key: StorageKey;
  replace?: boolean;
  options: O;
}

export type SPITokenFactory<O extends SPIOptions> = (options: O) => SPIToken<O> | undefined;

export class SPIFactory {
  private static TOKEN_PROPERTY = 'Token';

  private static SELECTOR_PROPERTY = 'Selector';

  public static Storage<V = unknown, RO extends SPIOptions = SPIOptions, SO extends SPIOptions = RO>(
    matchKeys: SPIMatchKeys,
    options?: {
      key?: StorageKey;
      tokenPropertyKey?: string;
      selectorPropertyKey?: string;
      tokenGenerator?: (storageKey: StorageKey, options: RO) => SPIToken<RO> | undefined;
      selector?: (storageKey: StorageKey) => SPISelector<SO, V>;
    }
  ) {
    return <T extends Object>(target: T) => {
      const storageKey = options?.key || uniqueKeyGenerator();

      SPIOperator.createStorage({
        key: storageKey,
        matchKeys
      });

      const tokenPropertyKey = options?.tokenPropertyKey || SPIFactory.TOKEN_PROPERTY;
      Reflect.set(target, tokenPropertyKey, (registerOptions: RO) => {
        return (options?.tokenGenerator || SPISelectorFactory.GeneratorToken)(storageKey, registerOptions);
      });

      const selectorPropertyKey = options?.selectorPropertyKey || SPIFactory.SELECTOR_PROPERTY;
      Reflect.set(target, selectorPropertyKey, (options?.selector || SPISelectorFactory.SingleSelector)(storageKey));
      return target;
    };
  }

  public static Register<O extends SPIOptions = SPIOptions>(token: SPIToken<O> | undefined, replace?: boolean) {
    return <T extends Object>(target: T) => {
      if (!token) {
        return;
      }
      let tokenReplace = replace;
      if (tokenReplace == null) {
        tokenReplace = token.replace;
      }
      if (tokenReplace == null) {
        tokenReplace = true;
      }
      SPIOperator.register(token.key, token.options, target, tokenReplace);
    };
  }
}

export class SPISelectorFactory {
  public static GeneratorToken<RO extends SPIOptions = SPIOptions>(storageKey: StorageKey, options: RO): SPIToken<RO> {
    return {
      key: storageKey,
      options
    };
  }

  public static SingleSelector<O extends SPIOptions = SPIOptions, V = unknown>(
    storageKey: StorageKey
  ): SPISingleSelector<O, V> {
    return (selectorOptions: O) => {
      return SPIOperator.selector<V>(storageKey, selectorOptions);
    };
  }

  public static MultiSelector<O extends SPIOptions = SPIOptions, V = unknown>(
    storageKey: StorageKey
  ): SPIMultiSelector<O, V> {
    return (selectorOptions: O) => {
      return SPIOperator.selectors<V>(storageKey, selectorOptions);
    };
  }
}

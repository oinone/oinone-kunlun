import { SPIFactory, type SPIOptions, type SPIMultiSelector, SPIOperator, type SPITokenFactory, SPIMatchAnyValue } from '@oinone/kunlun-spi';

export type IConfigProviderResult = Record<string, string | string[] | boolean | number | number[] | undefined>;

export interface ConfigProviderService {
  getConfig<T extends IConfigProviderResult = IConfigProviderResult>(key: string): T | null | undefined;
}

export interface ConfigProviderOptions extends SPIOptions {
  name?: string;
}

export type ConfigProviderType = ConfigProviderService | { new (): ConfigProviderService };

@SPIFactory.Storage(['name'], {
  selector: (storageKey): SPIMultiSelector<ConfigProviderOptions, ConfigProviderType> => {
    return (options) => {
      return SPIOperator.selectors<ConfigProviderType>(storageKey, { name: SPIMatchAnyValue });
    };
  }
})
export class ConfigProviderSPI {
  public static Token: SPITokenFactory<ConfigProviderOptions>;

  public static Selector: SPIMultiSelector<ConfigProviderOptions, ConfigProviderType>;

  public static register(options: ConfigProviderOptions, service: ConfigProviderService): boolean {
    const token = ConfigProviderSPI.Token(options);
    if (token) {
      return SPIOperator.register(token.key, token.options, service);
    }
    return false;
  }
}

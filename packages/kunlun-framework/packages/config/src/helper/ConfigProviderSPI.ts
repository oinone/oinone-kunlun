import { SPIFactory, SPIOptions, SPIMultiSelector, SPIOperator, SPITokenFactory } from '@oinone/kunlun-spi';

export interface ConfigProviderService {
  getConfig?(key: string): Record<string, any>;
}

export interface ConfigProviderOptions extends SPIOptions {
  type?: string;
}

export type ConfigProviderType = ConfigProviderService | { new (): ConfigProviderService };

@SPIFactory.Storage(['config'], {
  selector: (storageKey): SPIMultiSelector<ConfigProviderOptions, ConfigProviderType> => {
    return (options) => {
      return SPIOperator.selectors<ConfigProviderType>(storageKey, options);
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

import { SPIFactory, SPIOperator, SPIOptions, SPISingleSelector, SPITokenFactory } from '@oinone/kunlun-spi';

export interface MaskRegisterOptions extends SPIOptions {
  module?: string;
  moduleName?: string;
  model?: string;
  actionName?: string | string[];
}

@SPIFactory.Storage(['module', 'moduleName', 'model', 'actionName'], { key: Symbol('MaskTpl') })
export class MaskManager {
  private static Token: SPITokenFactory<MaskRegisterOptions>;

  private static Selector: SPISingleSelector<MaskRegisterOptions, string>;

  public static register(options: MaskRegisterOptions, template: string): boolean {
    const token = MaskManager.Token(options);
    if (token) {
      return SPIOperator.register(token.key, token.options, template);
    }
    return false;
  }

  public static selector(options: MaskRegisterOptions): string | undefined {
    return MaskManager.Selector(options);
  }
}

export type IMaskOption = MaskRegisterOptions;

export function registerMask(maskTpl: string, maskOption?: IMaskOption) {
  if (!maskTpl) {
    console.warn('maskTpl is blank');
    return false;
  }
  return MaskManager.register(maskOption || {}, maskTpl);
}

export function generatorMask(maskOption?: IMaskOption): string | undefined {
  return MaskManager.selector(maskOption || {});
}

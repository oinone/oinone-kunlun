import { ViewType } from '@oinone/kunlun-meta';
import { SPIFactory, SPIOperator, type SPIOptions, type SPISingleSelector, type SPITokenFactory } from '@oinone/kunlun-spi';

export interface MaskRegisterOptions extends SPIOptions {
  /**
   * 视图类型
   */
  viewType?: ViewType | ViewType[];
  /**
   * 模块编码
   */
  module?: string | string[];
  /**
   * 模块名称
   */
  moduleName?: string | string[];
  /**
   * 模型编码
   */
  model?: string | string[];
  /**
   * 模型名称
   */
  modelName?: string | string[];
  /**
   * 视图名称
   */
  viewName?: string | string[];
  /**
   * 动作名称
   */
  actionName?: string | string[];
}

@SPIFactory.Storage(['viewType', 'module', 'moduleName', 'model', 'modelName', 'viewName', 'actionName'], {
  key: Symbol('MaskTpl')
})
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

/**
 * @deprecated please use {@link MaskRegisterOptions}
 */
export type IMaskOption = MaskRegisterOptions;

export function registerMask(maskTpl: string, maskOption?: MaskRegisterOptions) {
  if (!maskTpl) {
    console.warn('maskTpl is blank');
    return false;
  }
  return MaskManager.register(maskOption || {}, maskTpl);
}

export function generatorMask(maskOption?: MaskRegisterOptions): string | undefined {
  return MaskManager.selector(maskOption || {});
}

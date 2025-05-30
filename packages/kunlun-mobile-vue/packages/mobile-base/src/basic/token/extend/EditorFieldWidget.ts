import { Constructor } from '@kunlun/shared';
import { SPI, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { VueWidget } from '@kunlun/vue-widget';
import { BaseFieldOptions, BaseFieldWidget } from '../BaseFieldWidget';

/**
 * 编辑字段组件注册Token
 */
@SPI.Base('EditorField', ['viewType', 'widget', 'ttype', 'multi', 'model', 'name'])
export class EditorFieldWidget extends VueWidget {
  public static Token: SPITokenFactory<BaseFieldOptions>;

  public static Selector: SPISingleSelector<BaseFieldOptions, Constructor<BaseFieldWidget>>;
}

import type { Constructor } from '@oinone/kunlun-shared';
import { SPI, type SPISingleSelector, type SPITokenFactory } from '@oinone/kunlun-spi';
import { VueWidget } from '@oinone/kunlun-vue-widget';
import { type BaseFieldOptions, BaseFieldWidget } from '../BaseFieldWidget';

/**
 * 编辑字段组件注册Token
 */
@SPI.Base('EditorField', ['viewType', 'ttype', 'multi', { key: 'widget', weight: 999 }, 'model', 'viewName', 'name'])
export class EditorFieldWidget extends VueWidget {
  public static Token: SPITokenFactory<BaseFieldOptions>;

  public static Selector: SPISingleSelector<BaseFieldOptions, Constructor<BaseFieldWidget>>;
}

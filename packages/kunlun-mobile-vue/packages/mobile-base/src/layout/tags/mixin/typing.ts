import { WidgetTagContext } from '@oinone/kunlun-vue-widget';
import { InternalMaskWidget } from '../resolve';

export interface MaskWidgetTagMixinContext extends WidgetTagContext {
  getWidgetTag(): InternalMaskWidget | string;

  getCustomProps(): Record<string, unknown>;
}

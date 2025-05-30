import { WidgetTagContext } from '@kunlun/vue-widget';
import { InternalWidget } from '../resolve';

export interface BaseWidgetTagMixinContext extends WidgetTagContext {
  inline: boolean;

  getWidgetTag(): InternalWidget | string;

  getMetadataHandle(): string;

  getRootHandle(): string;

  getInline(): boolean;

  getCustomProps(): Record<string, unknown>;
}

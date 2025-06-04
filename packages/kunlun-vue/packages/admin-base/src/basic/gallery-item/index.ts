import { ViewType } from '@oinone/kunlun-meta';
import { registerFieldMixinComponent } from '../../spi';
import DefaultGalleryItem from './DefaultGalleryItem.vue';

registerFieldMixinComponent({ viewType: ViewType.Gallery }, DefaultGalleryItem);

export * from './props';

export { DefaultGalleryItem };

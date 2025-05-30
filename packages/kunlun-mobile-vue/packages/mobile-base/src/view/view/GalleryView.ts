import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseListView, BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Gallery }))
export class GalleryView extends BaseListView {}

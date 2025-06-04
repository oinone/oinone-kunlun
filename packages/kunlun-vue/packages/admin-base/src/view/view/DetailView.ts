import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseObjectView, BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Detail }))
export class DetailView extends BaseObjectView {}

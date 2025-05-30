import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseObjectView, BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Detail }))
export class DetailView extends BaseObjectView {}

import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Multiple }))
export class MultipleView extends BaseView {}

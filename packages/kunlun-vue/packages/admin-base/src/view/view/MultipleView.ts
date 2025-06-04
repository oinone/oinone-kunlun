import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Multiple }))
export class MultipleView extends BaseView {}

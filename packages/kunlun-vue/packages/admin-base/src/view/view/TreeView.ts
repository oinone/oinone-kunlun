import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseListView, BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Tree }))
export class TreeView extends BaseListView {}

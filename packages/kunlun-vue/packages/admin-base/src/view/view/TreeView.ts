import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseListView, BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Tree }))
export class TreeView extends BaseListView {}

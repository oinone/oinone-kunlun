import { registerPopupConstructor } from '@oinone/kunlun-engine';
import { StaticDialogWidget, StaticDrawerWidget } from '../view';

registerPopupConstructor({ type: 'dialog' }, StaticDialogWidget);
registerPopupConstructor({ type: 'drawer' }, StaticDrawerWidget);

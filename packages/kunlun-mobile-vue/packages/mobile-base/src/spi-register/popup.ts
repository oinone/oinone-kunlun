import { registerPopupConstructor } from '@kunlun/engine';
import { StaticDialogWidget, StaticDrawerWidget } from '../view';

registerPopupConstructor({ type: 'dialog' }, StaticDialogWidget);
registerPopupConstructor({ type: 'drawer' }, StaticDrawerWidget);

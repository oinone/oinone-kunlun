import { ActionType } from '@kunlun/meta';
import { convertClientAction } from './client-action';
import { convertCompositionAction } from './composition-action';
import { convertServerAction } from './server-action';
import { ActionConverterOptions, registerConverter } from './spi';
import { convertUrlAction } from './url-action';
import { convertViewAction } from './view-action';

registerConverter({ actionType: ActionType.Client }, convertClientAction);
registerConverter({ actionType: ActionType.Composition }, convertCompositionAction);
registerConverter({ actionType: ActionType.Server }, convertServerAction);
registerConverter({ actionType: ActionType.URL }, convertUrlAction);
registerConverter({ actionType: ActionType.View }, convertViewAction);

export { resolveAction } from './resolve';
export { ActionConverterOptions, registerConverter as registerActionConverter };

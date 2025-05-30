import { Boot } from '@wangeditor/editor';
import { wangEditorExpressionModule } from './expression';

export * from './expression';

Boot.registerModule(wangEditorExpressionModule);

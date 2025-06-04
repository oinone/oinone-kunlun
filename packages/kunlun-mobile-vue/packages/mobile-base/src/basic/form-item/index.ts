import { ViewType } from '@oinone/kunlun-meta';
import { registerEditorFieldMixinComponent, registerFieldMixinComponent } from '../../spi';
import DefaultFormItem from './DefaultFormItem.vue';
import TableEditorItem from './TableEditorItem.vue';

registerFieldMixinComponent({ viewType: [ViewType.Form, ViewType.Detail, ViewType.Search] }, DefaultFormItem);

registerEditorFieldMixinComponent({ viewType: ViewType.Table }, TableEditorItem);

export * from './props';

export * from './BaseFormItemWidget';

export { DefaultFormItem, TableEditorItem };

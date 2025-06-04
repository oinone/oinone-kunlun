import { IModel, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { IVariableContextItem } from '@oinone/kunlun-vue-expression';
import { FormHtmlRichTextFieldWidget } from '../richtext/FormHtmlRichTextFieldWidget';
import { FormFieldWidget } from '../../../../basic';
import Component from './ExpressionRichText.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.Text, ModelFieldType.HTML],
    widget: ['ExpressionRichText']
  })
)
export class FormHTMLExpressionRichTextWidget extends FormHtmlRichTextFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Component);
    return this;
  }

  @Widget.Reactive()
  protected get contextItems(): IVariableContextItem[] {
    return this.modelList.map((model) => {
      return {
        name: model.id,
        displayName: model.label,
        models: [model && model.model],
        modelFields: model.modelFields
      } as IVariableContextItem;
    });
  }

  @Widget.Reactive()
  protected modelList = [] as IModel[];
}

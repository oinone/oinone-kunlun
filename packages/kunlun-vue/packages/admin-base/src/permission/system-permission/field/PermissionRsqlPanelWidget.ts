import { RsqlConditionPanelWidget } from '../../../field';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { Widget } from '@oinone/kunlun-vue-widget';
import { IQueryExpressionParam } from '@oinone/kunlun-vue-expression';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'PermRsqlPanel'
  })
)
export class PermissionRsqlPanelWidget extends RsqlConditionPanelWidget {
  @Widget.Reactive()
  public get queryExpressionParam(): IQueryExpressionParam {
    return {
      model: this.field?.model,
      field: this.field?.name,
      key: this.formData?.code as string
    } as IQueryExpressionParam;
  }
}

import { PamirsCompany, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, SelectFieldWidget } from '../../../../basic';
import { CompanySelect, CompanySelectBizStyle } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToOne,
    widget: 'Company'
  })
)
export class FormM2OCompanyFieldWidget extends SelectFieldWidget<PamirsCompany, PamirsCompany, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CompanySelect);
    return this;
  }

  @Widget.Reactive()
  protected get bizStyle(): string | undefined {
    return Optional.ofNullable(super.bizStyle).orElse(CompanySelectBizStyle.style2);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2O(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }
}

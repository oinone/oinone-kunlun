import { PamirsCompany, RuntimeM2MField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, SelectFieldWidget } from '../../../../basic';
import { CompanySelect, CompanySelectBizStyle } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'Company'
  })
)
export class FormM2MCompanyFieldWidget extends SelectFieldWidget<PamirsCompany, PamirsCompany[], RuntimeM2MField> {
  @Widget.Reactive()
  protected mode: SelectMode = SelectMode.multiple;

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
    return SubmitRelationHandler.M2M(
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

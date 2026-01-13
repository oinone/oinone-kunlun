import { PamirsCompany, RuntimeRelationField } from '@oinone/kunlun-engine';
import { Optional } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectFieldWidget } from '../../../../basic';
import { CompanySelect, CompanySelectBizStyle } from '../../../../components';

export abstract class AbstractFormCompanyFieldWidget<
  Option extends PamirsCompany = PamirsCompany,
  Value extends PamirsCompany | PamirsCompany[] = PamirsCompany | PamirsCompany[],
  Field extends RuntimeRelationField = RuntimeRelationField
> extends SelectFieldWidget<Option, Value, Field> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CompanySelect);
    return this;
  }

  @Widget.Reactive()
  protected get bizStyle(): string | undefined {
    return Optional.ofNullable(super.bizStyle).orElse(CompanySelectBizStyle.style2);
  }
}

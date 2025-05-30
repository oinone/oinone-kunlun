import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2OSelectFieldWidget } from '../../form/m2o';
import FormResourceLangBadge from './FormResourceLangBadge.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne,
    widget: 'LanguageBadge'
  })
)
export class FormResourceLangBadgeWidget extends FormM2OSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormResourceLangBadge);

    return this;
  }

  protected handleSelectOption(optionDataList, referencesModel) {
    const rst = super.handleSelectOption(optionDataList, referencesModel);

    return rst.map((r) => ({
      ...r,
      icon: this.dataList.find((d) => d.id === r.value)?.fullFontClass
    }));
  }
}

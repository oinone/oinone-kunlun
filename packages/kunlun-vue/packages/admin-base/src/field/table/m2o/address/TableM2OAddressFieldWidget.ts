import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { RowContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
import { VNode } from 'vue';
import { BaseFieldWidget } from '../../../../basic';
import { ResourceAddress } from '../../../../typing';
import { TableM2OFieldWidget } from '../../relation';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Address'
  })
)
export class TableM2OAddressFieldWidget extends TableM2OFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context) as ResourceAddress | undefined;
    if (value) {
      return [
        value.countryName,
        value.provinceName,
        value.cityName,
        value.districtName,
        value.streetName,
        value.street2
      ]
        .filter((v) => !!v)
        .join(' / ');
    }
    return '';
  }
}

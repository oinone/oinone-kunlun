import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { VNode } from 'vue';
import { BaseFieldWidget, TableObjectFieldWidget } from '../../../../basic';
import { ResourceAddress } from '../../../../typing';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Address'
  })
)
export class TableM2OAddressFieldWidget extends TableObjectFieldWidget {
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

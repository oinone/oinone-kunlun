import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DefaultFieldPermissionWidget } from '../permission-field/DefaultFieldPermissionWidget';

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'default-data-permission' }))
export class DefaultDataPermissionWidget extends DefaultFieldPermissionWidget {
  @Widget.Reactive()
  protected get tableModelXml() {
    return `
            <view type="table" checkbox="false" height="500">
              <field data="moduleName" label="所属应用"  />
              <field data="displayName" label="模型名称" />
              <field data="description" label="描述" />
          </view>
          `;
  }

  @Widget.Reactive()
  protected get tableFieldXml() {
    return '';
  }
}

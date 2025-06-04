import { Condition } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FieldPermissionWidget } from '../../../permission';
import FieldPermission from './FieldPermission.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'default-field-permission' }))
export class DefaultFieldPermissionWidget extends FieldPermissionWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FieldPermission);
    return this;
  }

  @Widget.Reactive()
  protected get tableModelXml() {
    return `
            <view type="table" checkbox="false" height="500">
              <element widget="radioColumn" />
              <field data="moduleName" label="所属应用"  />
              <field data="displayName" label="模型名称" />
              <field data="description" label="描述" />
          </view>
          `;
  }

  @Widget.Reactive()
  protected get tableFieldXml() {
    return `
            <view type="table" height="500" checkbox="false">
              <field data="fieldDisplayName" label="字段显示名称" />
              <field data="field" label="字段技术名称"  />
              <field data="fieldTtype" label="字段类型"  />
              <field data="description" label="字段描述"/>
              <field data="active" label="可见" />
              <field data="permRead" label="可编辑" />
          </view>
          `;
  }

  @Widget.Method()
  protected onTableSearch(type: 'model' | 'field', params: Record<string, string>) {
    let condition!: Condition;

    Object.entries(params).forEach(([key, val]) => {
      if (val) {
        const cond = new Condition(key).like(`%${val}%`);
        if (!condition) {
          condition = cond;
        } else {
          condition.and(cond);
        }
      }
    });

    const widget = type === 'model' ? this.modelTable! : this.fieldTable!;

    widget.tableRefreshProcess(condition);
  }
}

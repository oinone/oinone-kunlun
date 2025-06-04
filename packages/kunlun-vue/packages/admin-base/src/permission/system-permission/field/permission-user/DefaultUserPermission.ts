import { ViewType } from '@oinone/kunlun-meta';
import { ViewCache } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { Condition } from '@oinone/kunlun-request';

import { FormFieldWidget } from '../../../../basic';
import { DefaultFieldPermissionWidget } from '../permission-field/DefaultFieldPermissionWidget';
import { ResourcePermissionUserModel } from '../../../permission/type';
import { UserTableWidget } from '../../../permission/field/internal-widget/UserTableWidget';
import { createRuntimeContextForWidget } from '../../../../tags';
import Component from './UserPermission.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'default-user-permission' }))
export class DefaultUserPermissionWidget extends DefaultFieldPermissionWidget {
  public initialize(props: any): this {
    super.initialize(props);
    this.setComponent(Component);
    return this;
  }

  protected userTable: UserTableWidget | undefined;

  @Widget.Reactive()
  protected get tableModelXml() {
    return `
            <view type="table" checkbox="false" height="500">
              <field data="name" label="名称"  />
              <field data="login" label="登录账号" />
              <field data="active" label="是否有效" />
          </view>
          `;
  }

  @Widget.Reactive()
  protected get tableFieldXml() {
    return '';
  }

  @Widget.Watch('formData.id', { immediate: true, deep: true })
  protected fetchNodeByRole(id) {
    if (id) {
      const id = this.formData.id as string;

      this.userTable!.setDefaultCondition(new Condition('roles.id').equal(id));
      this.userTable?.tableRefreshProcess();
    }
  }

  protected async createModelTableWidget() {
    this.userTable?.dispose();
    this.userTable = undefined;
    const view = await ViewCache.compile(
      ResourcePermissionUserModel.model,
      '$$field-permission-user-table-view',
      this.tableModelXml
    );
    if (!view) {
      return;
    }
    const runtimeContext = createRuntimeContextForWidget({
      ...view,
      type: ViewType.Table
    });
    const runtimeContextHandle = runtimeContext.handle;
    this.userTable = this.createWidget(UserTableWidget, 'model', {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      template: runtimeContext.viewTemplate,
      inline: true
    }) as any;
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

    this.userTable!.tableRefreshProcess(condition);
  }
}

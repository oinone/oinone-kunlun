import { ActiveRecord, RuntimeO2MField, SubmitValue, ViewCache } from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { HttpClient } from '@kunlun/request';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { AsyncFormSubviewListFieldWidget, FormFieldWidget } from '../../../basic';
import { createRuntimeContextForWidget } from '../../../tags';
import { IPermission, ResourcePermissionFieldGroupsModel, ResourcePermissionModel } from '../type';
import FieldPermission from './FieldPermission.vue';
import { ModelTableWidget, PermissionTableWidget } from './internal-widget';

const http = HttpClient.getInstance();

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'field-permission' }))
export class FieldPermissionWidget extends AsyncFormSubviewListFieldWidget<RuntimeO2MField> {
  @Widget.Reactive()
  public get disabled() {
    return this.getDsl().detail || false;
  }

  /**
   * 重置数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide('submitCallChaining')
  protected resetSubmitCallChaining: CallChaining<SubmitValue> | undefined;

  private permission: IPermission[] = [];

  protected modelTable: ModelTableWidget | undefined;

  protected fieldTable: PermissionTableWidget | undefined;

  private _fieldPermissions: IPermission[] = [];

  private _activeFields: IPermission[] = [];

  public initialize(props) {
    super.initialize(props);
    this.setComponent(FieldPermission);
    return this;
  }

  protected get tableModelXml() {
    return `
            <view type="table" checkbox="false" height="500">
              <element widget="radioColumn" />
              <field data="name"/>
              <field data="displayName"/>
          </view>
          `;
  }

  protected get tableFieldXml() {
    return `
            <view type="table" height="500">
              <field data="field"/>
              <field data="description"/>
              <field data="permRead" editable="true"/>
          </view>
          `;
  }

  protected async initSubview() {
    await this.createModelTableWidget();
    await this.createFieldTableWidget();
    this.forceUpdate();
  }

  protected async createModelTableWidget() {
    this.modelTable?.dispose();
    this.modelTable = undefined;
    const view = await ViewCache.compile(
      ResourcePermissionFieldGroupsModel.model,
      '$$field-permission-model-table-view',
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
    this.modelTable = this.createWidget(ModelTableWidget, 'model', {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      template: runtimeContext.viewTemplate,
      inline: true,
      onRadioChangeHandler: this.modelTableRadioChangeHandler.bind(this)
    });
  }

  protected modelTableRadioChangeHandler(data: ActiveRecord) {
    this.fieldTable?.load(async () => {
      const modelName = data.model as string;
      const queryStr = `{
          interactionPermissionQuery {
            colPermissions(interactionPermission: {
              ${this.formData.id ? `roleId: ${this.formData.id}` : ''}, 
              model:"${modelName}",
            }) {
              colPermissions {
                id
                field
                fieldDisplayName
                name
                model
                modelDisplayName
                description
                domainExp
                permissionType
                active
                permRead
                fieldTtype
              }
            }
          }
        }`;
      this._fieldPermissions.forEach((fp) => {
        if (!this.permission.find((pp) => pp.name === fp.name)) {
          this.permission.push(fp);
        }
      });
      const result = await http.query('auth', queryStr);
      this._fieldPermissions = (
        (result.data.interactionPermissionQuery as Record<string, unknown>).colPermissions as Record<string, unknown>
      ).colPermissions as IPermission[];
      this._fieldPermissions.forEach((fp) => {
        fp.permissionType = 'COL';
        const pp = this.permission.find((p) => p.name === fp.name);
        if (pp) {
          fp.permRead = pp.permRead;
        }
      });
      this.fieldTable?.setData(this._fieldPermissions);
    });
  }

  protected async createFieldTableWidget() {
    this.fieldTable?.dispose();
    this.fieldTable = undefined;
    const view = await ViewCache.compile(
      ResourcePermissionModel.model,
      '$$field-permission-permission-table-view',
      this.tableFieldXml
    );
    if (!view) {
      return;
    }
    const runtimeContext = createRuntimeContextForWidget({
      ...view,
      type: ViewType.Table
    });
    const runtimeContextHandle = runtimeContext.handle;
    this.fieldTable = this.createWidget(PermissionTableWidget, 'field', {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      dataSource: [],
      activeRecords: [],
      template: runtimeContext.viewTemplate,
      inline: true,
      onCheckedChangeHandler: this.fieldTableCheckedChangeHandler.bind(this)
    });
  }

  protected fieldTableCheckedChangeHandler(data: ActiveRecord[]) {
    this._activeFields = data as IPermission[];
  }

  @Widget.Reactive()
  private searchText = '';

  @Widget.Method()
  private search(searchText) {
    this.searchText = searchText;
    this.modelTable?.setSearchText(searchText);
  }

  @Widget.Method()
  private batchEnable() {
    this._activeFields.forEach((f) => {
      f.permRead = true;
      if (!this.permission.find((p) => p.model === f.model && p.name === f.name)) {
        this.permission.push(f);
      }
    });
  }

  @Widget.Method()
  private batchDisable() {
    this._activeFields.forEach((f) => {
      f.permRead = false;
      if (!this.permission.find((p) => p.model === f.model && p.name === f.name)) {
        this.permission.push(f);
      }
    });
  }

  public async submit() {
    const result: Record<string, unknown> = {};
    result.fieldPermissions = this.permission;
    return result;
  }
}

import { RuntimeO2MField, SubmitValue, ViewCache } from '@kunlun/engine';
import { ModelDefaultActionName, ViewType } from '@kunlun/meta';
import { http } from '@kunlun/service';
import { CallChaining, GraphqlHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { AsyncFormSubviewListFieldWidget, FormFieldWidget } from '../../../basic';
import { IPermission, ResourcePermissionModel } from '../type';

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'data-permission' }))
export class DataPermissionWidget extends AsyncFormSubviewListFieldWidget<RuntimeO2MField> {
  @Widget.Reactive()
  public get disabled() {
    return this.viewType === ViewType.Detail;
  }

  /**
   * 重置数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide('submitCallChaining')
  protected resetSubmitCallChaining: CallChaining<SubmitValue> | undefined;

  @Widget.Reactive()
  protected get subviewModel(): string {
    return ResourcePermissionModel.model;
  }

  @Widget.Reactive()
  protected get subviewModelName(): string {
    return ResourcePermissionModel.name;
  }

  @Widget.Reactive()
  protected get subviewModule(): string | undefined {
    return ResourcePermissionModel.module;
  }

  @Widget.Reactive()
  protected get subviewModuleName(): string {
    return ResourcePermissionModel.moduleName;
  }

  protected async getViewDsl() {
    const template = (
      await ViewCache.compile(
        ResourcePermissionModel.model,
        '$$data-permission-table-view',
        `<view type="TABLE">
	<template slot="actions">
		<action name="${ModelDefaultActionName.$$internal_GotoM2MListDialog}">
			<template slot="default" title="添加数据权限">
				<view type="TABLE">
					<template slot="table" sortable="true" filter="permissionType=='ROW' and (model!='base.Menu' and (model!='base.UeModule' and (model!='base.Module' and (name=notlike='%超级管理员%'))))">
						<field data="permissionType" invisible="true" />
						<field data="model" invisible="true" />
						<field data="permissionDataSource" invisible="true" />
						<field data="active" invisible="true" />
						<field data="name" />
						<field data="description" />
						<field data="domainExp" />
						<field data="permRead" />
						<field data="permWrite" />
						<field data="permDelete" />
					</template>
				</view>
			</template>
		</action>
		<action name="${ModelDefaultActionName.$$internal_DeleteOne}" type="default" />
	</template>
	<template slot="table" height="500">
		<field data="name" />
		<field data="description" />
		<field data="domainExp" label="查询条件" />
		<field data="permRead" label="查询" editable="${!this.disabled}" />
		<field data="permWrite" label="修改" editable="${!this.disabled}" />
		<field data="permDelete" label="删除" editable="${!this.disabled}" />
	</template>
</view>`
      )
    )?.dsl as string;
    return JSON.parse(template);
  }

  public flushDataSource() {
    const { dataSource, submitCache, subviewSubmitCache } = this;
    let showRecords = dataSource;
    if (submitCache) {
      showRecords = submitCache.submit(dataSource || []);
    }
    if (subviewSubmitCache) {
      subviewSubmitCache.submit(dataSource || []);
    }
    this.dataSource = showRecords;
    this.refreshCallChaining?.syncCall();
  }

  protected async mountedProcess() {
    const queryStr = `{
      interactionPermissionQuery {
        dataPermissions(interactionPermission: {
              ${GraphqlHelper.buildStringGQLParameter('roleId', this.formData.id as string)}
            }) {
            rowPermissions {
              id
              name
              model
              modelDisplayName
              description
              domainExp
              permissionType
              active
              permRead
              permWrite
              permDelete
            }
        }
      }
    }`;
    let currentValues = (await http.query('auth', queryStr)).data.interactionPermissionQuery.dataPermissions
      .rowPermissions as IPermission[];
    if (currentValues == null) {
      currentValues = [];
      this.setValue(currentValues);
    }
    this.dataSource = currentValues;
  }

  public async submit() {
    const result: Record<string, unknown> = {};
    result.dataPermissions = this.dataSource;
    return result;
  }
}

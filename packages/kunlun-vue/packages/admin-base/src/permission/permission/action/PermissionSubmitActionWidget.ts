import { ActiveRecord, executeViewAction, RuntimeViewAction } from '@kunlun/engine';
import { ActionType } from '@kunlun/meta';
import { http } from '@kunlun/service';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { ActionWidget } from '../../../action/component/action/ActionWidget';
import { gotoPrevPage } from '../../../util';
import { IPermission } from '../type';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Client, name: '$$permission_submit' }))
export class PermissionSubmitActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || '确定';
  }

  @Widget.Reactive()
  protected get validateForm(): boolean {
    return true;
  }

  @Widget.Method()
  public async validateAndClick() {
    return this.load(async () => {
      const res = await this.validatorForm();
      if (!res) {
        return;
      }
      const role = (await this.submitCallChaining?.syncCall())?.records as ActiveRecord;
      role.groups = this.activeRecords?.[0].groups;
      const permissions: IPermission[] = [];
      const dp = role.dataPermissions as IPermission[];
      let menudp = dp.find((d) => d.model === 'base.Menu');
      if (!menudp) {
        menudp = {
          model: 'base.Menu',
          permissionType: 'ROW',
          name: `页面配置#${role.name}#菜单权限`,
          permRead: true,
          permissionDataSource: 'CUSTOM',
          active: true,
          domainExp: ''
        };
        dp.push(menudp);
      }
      const menus = role.menus as { value: string; module: string; name: string }[];
      const menuPermissions: { module: string; list: string[] }[] = [];
      (role.modules as { value: string }[]).forEach((m) => {
        const moduleMenus = menus.filter((_m) => _m.module === m.value);
        // if (moduleMenus.length) {
        menuPermissions.push({ module: m.value, list: moduleMenus.map((_m) => _m.name) });
        // }
      });
      menudp.domainExp =
        menuPermissions
          .map((mp) => {
            if (mp.list.length) {
              return `(name=in=(${mp.list.map((n) => `'${n}'`).join(',')}) and module == '${mp.module}')`;
            }
            return `(module == '${mp.module}')`;
          })
          .join(' or ') || '1!=1';
      let moduledp = dp.find((d) => d.model === 'base.Module');
      if (!moduledp) {
        moduledp = {
          model: 'base.Module',
          permissionType: 'ROW',
          name: `页面配置#${role.name}#应用权限Module`,
          permRead: true,
          permissionDataSource: 'CUSTOM',
          active: true,
          domainExp: ''
        };
        dp.push(moduledp);
      }
      let uemoduledp = dp.find((d) => d.model === 'base.UeModule');
      if (!uemoduledp) {
        uemoduledp = {
          model: 'base.UeModule',
          permissionType: 'ROW',
          name: `页面配置#${role.name}#应用权限UeModule`,
          permRead: true,
          permissionDataSource: 'CUSTOM',
          active: true,
          domainExp: ''
        };
        dp.push(uemoduledp);
      }
      const modules = role.modules as { value: string }[];
      moduledp.domainExp = modules.length ? `module =in= (${modules.map((m) => `'${m.value}'`).join(',')})` : '1!=1';
      uemoduledp.domainExp = moduledp.domainExp;
      dp.forEach((p) => permissions.push(p));
      const ap = role.actionPermissions as IPermission[];
      ap.forEach((p) => permissions.push(p));
      const fp = role.fieldPermissions as IPermission[];
      fp.forEach((p) => permissions.push(p));

      const defaultAuthGroupName = `页面配置#${role.name}#权限组`;
      const authGroupId = ((role.groups as { id: number, name: string }[]).find((a => a.name === defaultAuthGroupName)) || {}).id;
      const method = role.id ? 'interactionUpdate' : 'interactionCreate';
      const submitStr = `
    mutation {
      authGroupMutation {
        ${method} (
        data: {
          ${authGroupId ? `id:${authGroupId},` : ``}
          name: "${defaultAuthGroupName}",
          roles: [
            {
              code: "${role.code || ''}",
              description: "${role.description || ''}",
              active: ${role.active || false},
              name: "${role.name}",
              roleTypeCode: "${role.roleTypeCode || ''}",
              ${role.id ? `id: ${role.id}` : ''}
            }
          ],
          permissions: [${permissions
            .map((p) => {
              return `
        {
          name:"${p.name}",
          permissionType:${p.permissionType},
          model:"${p.model}",
          permissionDataSource:${p.permissionDataSource || 'CUSTOM'},
          active:true
          ${p.action ? `,action:"${p.action}"` : ''}
          ${p.field ? `,field:"${p.field}"` : ''}
          ${p.permissionMateDataType ? `,permissionMateDataType:${p.permissionMateDataType}` : ''}
          ${p.domainExp != null ? `,domainExp:"${p.domainExp}"` : ''}
          ${p.permRead != null ? `,permRead:${p.permRead}` : ''}
          ${p.permWrite != null ? `,permWrite:${p.permWrite}` : ''}
          ${p.permRun != null ? `,permRun:${p.permRun}` : ''}
          ${p.permDelete != null ? `,permDelete:${p.permDelete}` : ''}
          ${p.menuName != null ? `,menuName:"${p.menuName}"` : ''}
        }`;
            })
            .join(',')}] }) {
          name
          roles {
            id
          }
        }
      }
    }
    `;
      await http.query('auth', submitStr);
      this.historyBack();
    });
  }

  private historyBack() {
    gotoPrevPage(
      this.action,
      (action: RuntimeViewAction) => executeViewAction(action, this.$router, this.$matched),
      this.$router?.navigate
    );
  }
}

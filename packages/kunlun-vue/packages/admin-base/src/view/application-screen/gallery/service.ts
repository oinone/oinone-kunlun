import { ModelCache } from '@kunlun/engine';
import { http } from '@kunlun/service';

export enum AppBindType {
  MENU = 'MENU',
  VIEW = 'VIEW',
  URL = 'URL'
}

export const CreateAppForm = 'CreateAppForm';
export const UpdateAppForm = 'UpdateAppForm';
export const BindAppHomepageForm = 'BindAppHomepageForm';
export const EditAppModelModel = 'apps.AppsManagementModule';

export const CreateAppFormXml = `
<view type="FORM" model="apps.AppsManagementModule" name="CreateAppForm" title="创建">
    <field data="id" label="id" invisible="true"/>
    <field data="moduleType" label="类型" required="true" widget="Radio" hint="大型应用可将部分不需要页面维护的封装在模块中"/>
    <field data="displayName" label="名称" required="true"/>
    <field data="module" readonly="activeRecord.id" label="技术名称" pattern="^[A-Za-z](?!.*__.*)(?!.*_+$)[\\w]*$" tips="仅支持使用数字、字母、下划线，且以字母开头" minLength="3" maxLength="64"/>
    <field data="appsModuleDependencyList" label="依赖模块" widget="Select" domain="module!='\${activeRecord.module}'"/>
    <field data="appsModuleUpstreamList" label="上游模块" widget="AppsModuleUpstreamSelect" moduleOptionsField="appsModuleDependencyList" help="上游模块只能在依赖模块列表中选择"/>
    <field data="moduleCategory" label="分类" required="true" domain="parentCode=isnull=false"/>
    <field data="clientTypes" label="客户端类型"/>
    <field data="logo" label="图标" hint="建议上传宽高尺寸相同的图片" widget="UploadImg"/>
    <field data="description" label="描述"/>
</view>
`;

export const UpdateAppFormXml = `
<view type="FORM" model="apps.AppsManagementModule" name="UpdateAppForm" title="编辑">
    <field data="id" label="id" invisible="true"/>
    <field data="moduleType" label="类型" readonly="true" widget="Select" hint="大型应用可将部分不需要页面维护的封装在模块中"/>
    <field data="displayName" label="名称" required="true"/>
    <field data="module" readonly="true" label="技术名称" />
    <field data="appsModuleDependencyList" label="依赖模块" widget="Select" domain="module!='\${activeRecord.module}'" optionFields="id,displayName,module"/>
    <field data="appsModuleUpstreamList" label="上游模块" widget="AppsModuleUpstreamSelect" moduleOptionsField="appsModuleDependencyList" help="上游模块只能在依赖模块列表中选择" optionFields="id,displayName,module"/>
    <field data="moduleCategory" label="分类" required="true" domain="parentCode=isnull=false"/>
    <field data="clientTypes" label="客户端类型"/>
    <field data="logo" label="图标" hint="建议上传宽高尺寸相同的图片" widget="UploadImg"/>
    <field data="description" label="描述"/>
</view>
`;

export const BindAppHomepageFormXml = `
<view type="FORM" model="apps.AppsManagementModule" name="BindAppHomepageForm" title="设置首页">
    <field data="id" label="id" invisible="true"/>
    <field data="module" label="id" invisible="true"/>
    <field data="bindType" labelInvisible="true" widget="Radio" ttype="ENUM">
        <options>
            <option name="MENU" value="MENU" label="绑定菜单"></option>
            <option name="VIEW" value="VIEW" label="绑定视图"></option>
            <option name="URL" value="URL" label="绑定URL"></option>
        </options>
    </field>
    <field data="bindHomePageMenu" widget="TreeSelect" required="activeRecord.bindType == 'MENU'" label="菜单" placeholder="请选择菜单" invisible="activeRecord.bindType != 'MENU'" onlySelectedLeaf="true" fetchAll="true">
        <node model="apps.AppsModuleMenuProxy" label="activeRecord.displayName" labelFields="displayName" selfReferences="parentProxy" filter="module == '\${activeRecord.module}'" searchFields="displayName"/>
    </field>
    <field data="bindHomePageModel" label="模型" required="activeRecord.bindType == 'VIEW'" invisible="activeRecord.bindType != 'VIEW'" widget="AppHomepageModelSelect" optionLabel="activeRecord.displayName" clearFields="bindHomePageView" optionFields="displayName,rootModuleModule,model" queryData-rootModuleModule="activeRecord.module"/>
    <field data="bindHomePageView" label="页面" required="activeRecord.bindType == 'VIEW'" invisible="activeRecord.bindType != 'VIEW'" widget="Select" domain="model==\${activeRecord.bindHomePageModel.model}" optionFields="title,name" optionLabel="activeRecord.title || activeRecord.name"/>
    <field data="goToUiHomePage" labelInvisible="true" widget="GoToUiHomePage" ttype="STRING" invisible="activeRecord.bindType != 'VIEW'"/>
    <field data="urlHomePage" labelInvisible="true" widget="Form" invisible="rootRecord.bindType != 'URL'" submitType="all" relationUpdateType="all">
        <view type="form">
            <template slot="form">
                <field data="url" label="URL" ttype="STRING" required="rootRecord.bindType == 'URL'" widget="Input" />
                <field data="target" label="跳转类型" required="rootRecord.bindType == 'URL'" widget="Select">
                    <options>
                        <option name="INNER" value="INNER" label="页内路由"></option>
                        <option name="OPEN_WINDOW" value="OPEN_WINDOW" label="打开新窗口"></option>
                    </options>
                </field>
            </template>
        </view>
    </field>
</view>
`;

export async function bindHomePageByView(id, viewId) {
  const body = `
      mutation {
  appsManagementModuleMutation {
    bindHomePage(
      data: {
        id: ${id}
        bindHomePageView: { id: ${viewId} }
      }
    ) {
      homePage {
        id
        model
        name
        displayName
      }
    }
  }
}
  `;

  await http.mutate('apps', body);
}

export async function bindHomePageByMenu(id, menuId) {
  const body = `
      mutation {
  appsManagementModuleMutation {
    bindHomePage(
      data: {
        id: ${id}
        bindHomePageMenu: { id: ${menuId} }
      }
    ) {
      homePage {
        id
        model
        name
        displayName
      }
    }
  }
}
  `;

  await http.mutate('apps', body);
}

export async function bindHomePageByURL(id, url, target) {
  const body = `
      mutation {
  appsManagementModuleMutation {
    bindHomePage(
      data: {
        id: ${id}
        urlHomePage: {
          target: ${target}
          url: "${url}"
        }
      }
    ) {
      homePage {
        id
        model
        name
        displayName
      }
    }
  }
}
  `;

  await http.mutate('apps', body);
}

export async function appQueryOne(id) {
  const model = await ModelCache.get(EditAppModelModel);
  const hasAppsModuleUpstreamList = !!model?.modelFields.find((v) => v.data === 'appsModuleUpstreamList');
  const hasUrlHomePage = !!model?.modelFields.find((it) => it.data === 'urlHomePage');
  const body = `
      query{
    appsManagementModuleQuery{
        queryOne(query:{
            id:${id}
        }) {
            id
            moduleType
            clientTypes
            bindHomePageModel {
                id
                model
                name
                displayName
            }
            bindHomePageView {
                id
                title
                name
                model
            }
            bindHomePageMenu {
                id
                displayName
                name
                model
                module
            }
            ${
              hasUrlHomePage
                ? `
            urlHomePage {
                target
                url
            }
            `
                : ''
            }
            homePageModel
            homePageName
            appsModuleDependencyList {
                id
                name
                module
                displayName
            }
            ${
              hasAppsModuleUpstreamList
                ? `
            appsModuleUpstreamList {
                id
                name
                module
                displayName
            }
            `
                : ''
            }
            application
            displayName
            module
            name
            moduleCategory{
                id
                name
                code
            }
            logo
            description
        }
    }
}
  `;

  const result = await http.query('apps', body);
  return result.data.appsManagementModuleQuery.queryOne;
}

export async function installAppFun(id) {
  const body = `
      mutation{
  appsManagementModuleMutation {
    install(module: { id: ${id} }) {
      id
      status
      state
    }
  }
}
  `;

  const result = await http.mutate('apps', body);
  return result.data.appsManagementModuleMutation.install;
}

export async function uninstallAppFun(id) {
  const body = `
      mutation{
  appsManagementModuleMutation {
    uninstall(module: { id: ${id} }) {
      id
      status
      state
    }
  }
}
  `;

  const result = await http.mutate('apps', body);
  return result.data.appsManagementModuleMutation.uninstall;
}

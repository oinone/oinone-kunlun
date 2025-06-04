import { executeViewAction, RedirectTargetEnum, RuntimeViewAction } from '@oinone/kunlun-engine';
import { IModel, IModule, IViewAction, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { getModel, queryOne } from '@oinone/kunlun-service';
import { CastHelper } from '@oinone/kunlun-shared';

/**
 * 跳转到模型设计器
 */
export const onJumpModelDesigner = async (module: IModel, modelDesignerDisplayType: 'list' | 'graph' = 'list') => {
  localStorage.setItem('modelDisplayType', modelDesignerDisplayType);
  localStorage.setItem('isLowCode', 'true');
  localStorage.setItem('moduleType', 'ALL');
  localStorage.setItem('currentModule', JSON.stringify(module));
  localStorage.setItem('modelDataSource', 'MANUAL');

  const model = await getModel('designer.DesignerModelDefinition');
  const action = model.viewActionList?.find((a) => a.name === 'homepage');

  if (action) {
    executeViewAction(
      CastHelper.cast(action),
      undefined,
      undefined,
      { appSwitcherName: '模型设计器', hideMenu: true, module: action.moduleName, sessionPath: null },
      RedirectTargetEnum.BLANK
    );
  }
};

/**
 * 跳转到逻辑设计器
 */
export const onJumpWorkflowDesigner = async (moduleModule) => {
  const model = await getModel('workflow.WorkflowDesigner');
  const action = model.viewActionList?.find((a) => a.name === 'homepage');

  if (action) {
    executeViewAction(
      {
        ...CastHelper.cast(action),
        resModule: 'workflowDesigner',
        resModuleName: 'workflowDesigner'
      },
      undefined,
      undefined,
      { appSwitcherName: '流程设计器', hideMenu: true, sessionPath: null },
      RedirectTargetEnum.BLANK
    );
  }
};

/**
 * 跳转到界面设计器设计页
 */
export const onJumpUiDesigner = async (viewId?: string) => {
  if (viewId) {
    const action = (await queryOne('base.ViewAction', {
      name: 'ui_designer_界面设计器页面编辑',
      model: 'ui.designer.UiDesignerView'
    })) as IViewAction;
    if (action) {
      return executeViewAction(CastHelper.cast(action), undefined, undefined, { id: viewId }, RedirectTargetEnum.BLANK);
    } else {
      console.error('跳转至页面设计页面异常');
    }
  }
};

/**
 * 跳转到界面设计器
 */
export const onJumpUiDesignerHomePage = async (module: IModule, isJumpHomepage?: boolean) => {
  const value = {
    id: module.id,
    displayName: module.displayName,
    name: module.name,
    module: module.module,
    application: true
  };
  localStorage.setItem('filterModule', JSON.stringify(value));
  localStorage.setItem('filterModular', JSON.stringify(value));
  localStorage.setItem('filterModel', '');
  localStorage.setItem('filterViewType', 'ALL');
  localStorage.setItem('filterViewBizType', 'ALL');

  const action = {
    viewType: ViewType.Table,
    name: 'homepage',
    model: 'ui.designer.UiDesignerView',
    resModuleName: 'uiDesigner',
    target: ViewActionTarget.Router
  } as RuntimeViewAction;
  const param = { appSwitcherName: '界面设计器', hideMenu: true };
  if (isJumpHomepage) {
    param['createViewSource'] = 'HOME_PAGE';
  }
  if (action) {
    executeViewAction(
      CastHelper.cast(action),
      undefined,
      undefined,
      {
        appSwitcherName: '界面设计器',
        hideMenu: true,
        createViewSource: 'HOME_PAGE',
        module: 'uiDesigner',
        sessionPath: null
      },
      RedirectTargetEnum.BLANK
    );
  }
};

/**
 * 低无一体主页
 */
export const onJumpCodeFuse = async (id) => {
  const model = await getModel('paas.codeFuse.CodeFuseModuleExtProjectDisplay');
  const action = model.viewActionList?.find((a) => a.name === 'PaasMenus_Menu_LowCodeMenu');

  if (action) {
    executeViewAction(
      CastHelper.cast(action),
      undefined,
      undefined,
      { initQueryParams: JSON.stringify({ moduleDefinition: { id } }), module: action.moduleName, sessionPath: null },
      RedirectTargetEnum.BLANK
    );
  }
};

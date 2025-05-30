import { isNil } from 'lodash';
import { Expression, ExpressionRunParam } from '@kunlun/expression';
import {
  ActiveRecord,
  Dialog,
  executeViewAction,
  FunctionMetadata,
  GenericFunctionService,
  ModelCache,
  ModuleCache,
  Pagination,
  QueryContext,
  QueryVariables,
  RedirectTargetEnum,
  RuntimeAction,
  RuntimeModelField,
  RuntimeViewAction,
  translateValueByKey,
  ViewCache
} from '@kunlun/engine';
import { IModelField, ViewType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import {
  customQueryPage,
  DEFAULT_TRUE_CONDITION,
  EDirection,
  getModel,
  http,
  insertOne,
  IQueryPageResult,
  ISort,
  updateOne
} from '@kunlun/service';
import { CastHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { appFinderSymbol } from '@kunlun/vue-admin-layout';
import { OioNotification } from '@kunlun/vue-ui-antd';
import { Widget, WidgetSubjection } from '@kunlun/vue-widget';
import { BaseElementListViewWidget, BaseElementWidget } from '../../../basic';
import { createRuntimeContextForWidget } from '../../../tags';
import { onJumpCodeFuse, onJumpModelDesigner, onJumpUiDesignerHomePage } from '../../../util';
import { FormWidget } from '../../form';
import GalleryVue from './Gallery.vue';
import {
  AppBindType,
  appQueryOne,
  BindAppHomepageForm,
  BindAppHomepageFormXml,
  bindHomePageByMenu,
  bindHomePageByURL,
  bindHomePageByView,
  CreateAppForm,
  CreateAppFormXml,
  EditAppModelModel,
  uninstallAppFun,
  UpdateAppForm,
  UpdateAppFormXml
} from './service';
import { ActionPermission, AppState, AppStateDisplayNameENum } from './type';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'AppsGallery' }))
export class AppsGalleryWidget extends BaseElementListViewWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryVue);
    return this;
  }

  private disableClick = ['logic_designer', 'model_designer', 'data_designer', 'ui_designer', 'workflow_designer'];

  private createAppDialogFormWidget!: FormWidget | undefined;

  private updateAppDialogFormWidget!: FormWidget | undefined;

  private bindAppHomepageDialogFormWidget!: FormWidget | undefined;

  @Widget.Reactive()
  private addFormViewData = {};

  protected executeInvisibleExpress(invisible?: string | boolean) {
    if (isNil(invisible)) {
      return false;
    }

    if (typeof invisible === 'boolean') {
      return invisible;
    }

    return !!Expression.run({ activeRecord: this.addFormViewData } as ExpressionRunParam, invisible, false);
  }

  @Widget.Reactive()
  private moduleCategory = [];

  @Widget.SubContext(appFinderSymbol)
  private reloadAppFinder$!: WidgetSubjection<boolean>;

  @Widget.Reactive()
  protected get defaultPageSize(): number {
    return 30;
  }

  @Widget.Reactive()
  protected get modelActions() {
    const actions = this.metadataRuntimeContext.viewDsl?.widgets.find((w) => w.slot === 'actions');

    if (!actions) {
      return [];
    }

    return actions.widgets as unknown as RuntimeAction[];
  }

  @Widget.Reactive()
  protected get actionPermission(): ActionPermission {
    const CreateAppAction = this.modelActions.find((a) => a.name === 'create');
    const UpdateAppAction = this.modelActions.find((a) => a.name === 'update');
    const UninstallAction = this.modelActions.find((a) => a.name === 'uninstall');
    const InstallAction = this.modelActions.find((a) => a.name === 'install');
    const BindHomepageAction = this.modelActions.find((a) => a.name === 'bindHomePage');
    const DetailAction = this.modelActions.find((a) => a.name === 'apps_business_screen_detail');

    const LikeAction = this.modelActions.find((a) => a.name === 'like');
    const UnLikeAction = this.modelActions.find((a) => a.name === 'unLike');

    const ModelDesignerAction = this.modelActions.find(
      (a) => a.name === 'homepage' && a.model === 'designer.DesignerModelDefinition'
    );
    const UiDesignerAction = this.modelActions.find(
      (a) => a.name === 'homepage' && a.model === 'ui.designer.UiDesignerView'
    );
    const PaasAction = this.modelActions.find((a) => a.name === 'PaasMenus_Menu_LowCodeMenu');

    return {
      hasCreateAppAction: !!CreateAppAction && !this.executeInvisibleExpress(CreateAppAction.invisible),
      hasUpdateAppAction: !!UpdateAppAction && !this.executeInvisibleExpress(UpdateAppAction.invisible),
      hasUninstallAction: !!UninstallAction && !this.executeInvisibleExpress(UninstallAction.invisible),
      hasInstallAction: !!InstallAction && !this.executeInvisibleExpress(InstallAction.invisible),
      hasBindHomepageAction: !!BindHomepageAction && !this.executeInvisibleExpress(BindHomepageAction.invisible),
      hasDetailAction: !!DetailAction && !this.executeInvisibleExpress(DetailAction.invisible),

      hasLikeAction: !!LikeAction && !this.executeInvisibleExpress(LikeAction.invisible),
      hasUnLikeAction: !!UnLikeAction && !this.executeInvisibleExpress(UnLikeAction.invisible),

      hasModelDesignerAction: !!ModelDesignerAction && !this.executeInvisibleExpress(ModelDesignerAction.invisible),
      hasUiDesignerAction: !!UiDesignerAction && !this.executeInvisibleExpress(UiDesignerAction.invisible),
      hasPaasAction: !!PaasAction && !this.executeInvisibleExpress(PaasAction.invisible)
    };
  }

  // #region 导出动作
  @Widget.Reactive()
  protected get hasExportAction() {
    const actionNames = Object.keys(this.exportAction);

    return actionNames.some(
      (name) => !!this.exportAction[name] && !this.executeInvisibleExpress(this.exportAction[name].invisible)
    );
  }

  @Widget.Reactive()
  protected get exportAction() {
    return {
      exportModelAction: this.modelActions.find((a) => a.name === 'modelDesignerDialog') as RuntimeViewAction,
      exportUiAction: this.modelActions.find((a) => a.name === 'uiDesignerDialog') as RuntimeViewAction,
      exportWorkFlowAction: this.modelActions.find((a) => a.name === 'wfDesignerDialog') as RuntimeViewAction,
      exportEipAction: this.modelActions.find((a) => a.name === 'eipDesignerDialog') as RuntimeViewAction,
      exportDataAction: this.modelActions.find((a) => a.name === 'dataDesignerDialog') as RuntimeViewAction,
      exportMicroFlowAction: this.modelActions.find((a) => a.name === 'mfDesignerDialog') as RuntimeViewAction,
      exportPrintAction: this.modelActions.find((a) => a.name === 'printDesignerDialog') as RuntimeViewAction
    };
  }

  // #endregion

  // #region 导入动作
  @Widget.Reactive()
  protected get hasImportAction() {
    const actionNames = Object.keys(this.importAction);

    return actionNames.some(
      (name) => !!this.importAction[name] && !this.executeInvisibleExpress(this.importAction[name].invisible)
    );
  }

  @Widget.Reactive()
  protected get importAction() {
    return {
      importModelAction: this.modelActions.find((a) => a.name === 'modelDesignerImportDialog') as RuntimeViewAction,
      importUiAction: this.modelActions.find((a) => a.name === 'uiDesignerImportDialog') as RuntimeViewAction,
      importWorkFlowAction: this.modelActions.find((a) => a.name === 'wfDesignerImportDialog') as RuntimeViewAction,
      importEipAction: this.modelActions.find((a) => a.name === 'eipDesignerImportDialog') as RuntimeViewAction,
      importDataAction: this.modelActions.find((a) => a.name === 'dataDesignerImportDialog') as RuntimeViewAction,
      importMicroFlowAction: this.modelActions.find((a) => a.name === 'mfDesignerImportDialog') as RuntimeViewAction,
      importPrintAction: this.modelActions.find((a) => a.name === 'printDesignerImportDialog') as RuntimeViewAction
    };
  }

  // #endregion

  // #region 同步部署动作
  @Widget.Reactive()
  protected get hasSyncAction() {
    const actionNames = Object.keys(this.syncAction);

    return actionNames.some(
      (name) => !!this.syncAction[name] && !this.executeInvisibleExpress(this.syncAction[name].invisible)
    );
  }

  @Widget.Reactive()
  protected get syncAction() {
    return {
      syncModelAction: this.modelActions.find((a) => a.name === 'modelDesignerSyncDialog') as RuntimeViewAction,
      syncUiAction: this.modelActions.find((a) => a.name === 'uiDesignerSyncDialog') as RuntimeViewAction,
      syncWorkFlowAction: this.modelActions.find((a) => a.name === 'wfDesignerSyncDialog') as RuntimeViewAction,
      syncEipAction: this.modelActions.find((a) => a.name === 'eipDesignerSyncDialog') as RuntimeViewAction,
      syncDataAction: this.modelActions.find((a) => a.name === 'dataDesignerSyncDialog') as RuntimeViewAction,
      syncMicroFlowAction: this.modelActions.find((a) => a.name === 'mfDesignerSyncDialog') as RuntimeViewAction,
      syncPrintAction: this.modelActions.find((a) => a.name === 'printDesignerSyncDialog') as RuntimeViewAction
    };
  }

  // #endregion

  @Widget.Reactive()
  protected get moreActions() {
    return [
      {
        displayName: translateValueByKey('编辑'),
        icon: 'oinone-jiemiansheji1',
        hasBorderBottom: true,
        visible: (record) => record.systemSource === 'UI' && this.actionPermission.hasUpdateAppAction,
        exe: (record) => {
          this.clickUpdateViewAction(record);
        }
      },
      {
        displayName: translateValueByKey('卸载'),
        icon: 'oinone-jiemiansheji1',
        hasBorderBottom: true,
        visible: (record) => record.state === AppState.INSTALLED && this.actionPermission.hasUninstallAction,
        exe: async (record) => {
          const result = await uninstallAppFun(record.id);
          if (result.state) {
            record.state = result.state;
          }
        }
      },
      {
        displayName: translateValueByKey('设置首页'),
        icon: 'oinone-jiemiansheji1',
        visible: (record) =>
          record.state === AppState.INSTALLED && record.application && this.actionPermission.hasBindHomepageAction,
        exe: (record) => {
          this.clickBindHomepageViewAction(record);
        }
      },
      {
        displayName: translateValueByKey('设计页面'),
        icon: 'oinone-shejiyemian',
        visible: (record) =>
          record.application &&
          !this.disableClick.includes(record.module) &&
          record.systemSource === 'UI' &&
          this.actionPermission.hasUiDesignerAction,
        exe: (record) => {
          onJumpUiDesignerHomePage(record);
        }
      },
      {
        displayName: translateValueByKey('设计模型'),
        icon: 'oinone-shejimoxing',
        visible: (record) => !this.disableClick.includes(record.module) && this.actionPermission.hasModelDesignerAction,
        exe: (record) => {
          onJumpModelDesigner(record, 'graph');
        }
      },
      {
        displayName: translateValueByKey('低无一体'),
        icon: 'oinone-diwuyiti',
        hasBorderBottom: true,
        visible: (record) => record.systemSource !== 'BASE' && this.actionPermission.hasPaasAction,
        exe: (record) => {
          onJumpCodeFuse(record.id);
        }
      },
      {
        displayName: translateValueByKey('设计导入（迁移）'),
        icon: 'oinone-a-shejidaoru4x',
        visible: (record) => this.hasImportAction && record.state === AppState.INSTALLED,
        children: [
          {
            displayName: translateValueByKey('模型导入'),
            icon: 'oinone-a-moxingdaoru3x',

            visible: (record) =>
              !!this.importAction.importModelAction &&
              !this.executeInvisibleExpress(this.importAction.importModelAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importModelAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('界面导入'),
            icon: 'oinone-a-jiemiandaoru2x',
            visible: (record) =>
              !!this.importAction.importUiAction &&
              !this.executeInvisibleExpress(this.importAction.importUiAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importUiAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('流程导入'),
            icon: 'oinone-a-liuchengdaoru2x',
            visible: (record) =>
              !!this.importAction.importWorkFlowAction &&
              !this.executeInvisibleExpress(this.importAction.importWorkFlowAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importWorkFlowAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('微流导入'),
            icon: 'oinone-a-liuchengdaoru2x',
            visible: (record) =>
              !!this.importAction.importMicroFlowAction &&
              !this.executeInvisibleExpress(this.importAction.importMicroFlowAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importMicroFlowAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('集成导入'),
            icon: 'oinone-a-jichengdaoru2x',
            visible: (record) =>
              !!this.importAction.importEipAction &&
              !this.executeInvisibleExpress(this.importAction.importEipAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importEipAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('数据可视化导入'),
            icon: 'oinone-a-shujukeshihuadaoru2x',
            visible: (record) =>
              !!this.importAction.importDataAction &&
              !this.executeInvisibleExpress(this.importAction.importDataAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importDataAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('打印导入'),
            icon: 'oinone-a-jiemiandaoru2x',
            visible: (record) =>
              !!this.importAction.importPrintAction &&
              !this.executeInvisibleExpress(this.importAction.importPrintAction.invisible),
            exe: (record) => {
              executeViewAction(this.importAction.importPrintAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          }
        ]
      },
      {
        displayName: translateValueByKey('设计导出'),
        icon: 'oinone-a-shejidaochu4x',
        visible: (record) => this.hasExportAction && record.state === AppState.INSTALLED,
        children: [
          {
            displayName: translateValueByKey('模型导出'),
            icon: 'oinone-a-moxingdaoru3x',
            visible: (record) =>
              !!this.exportAction.exportModelAction &&
              !this.executeInvisibleExpress(this.exportAction.exportModelAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportModelAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('界面导出'),
            icon: 'oinone-a-jiemiandaoru2x',
            visible: (record) =>
              !!this.exportAction.exportUiAction &&
              !this.executeInvisibleExpress(this.exportAction.exportUiAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportUiAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('流程导出'),
            icon: 'oinone-a-liuchengdaoru2x',
            visible: (record) =>
              !!this.exportAction.exportWorkFlowAction &&
              !this.executeInvisibleExpress(this.exportAction.exportWorkFlowAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportWorkFlowAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('微流导出'),
            icon: 'oinone-a-liuchengdaoru2x',
            visible: (record) =>
              !!this.exportAction.exportMicroFlowAction &&
              !this.executeInvisibleExpress(this.exportAction.exportMicroFlowAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportMicroFlowAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('集成导出'),
            icon: 'oinone-a-jichengdaoru2x',
            visible: (record) =>
              !!this.exportAction.exportEipAction &&
              !this.executeInvisibleExpress(this.exportAction.exportEipAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportEipAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('数据可视化导出'),
            icon: 'oinone-a-shujukeshihuadaoru2x',
            visible: (record) =>
              !!this.exportAction.exportDataAction &&
              !this.executeInvisibleExpress(this.exportAction.exportDataAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportDataAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('打印导出'),
            icon: 'oinone-a-jiemiandaoru2x',
            visible: (record) =>
              !!this.exportAction.exportPrintAction &&
              !this.executeInvisibleExpress(this.exportAction.exportPrintAction.invisible),
            exe: (record) => {
              executeViewAction(this.exportAction.exportPrintAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          }
        ]
      },
      {
        displayName: translateValueByKey('同步部署'),
        icon: 'oinone-a-tongbubushu4x',
        visible: (record) => this.hasSyncAction && record.state === AppState.INSTALLED,
        children: [
          {
            displayName: translateValueByKey('模型部署'),
            icon: 'oinone-a-moxingdaoru3x',
            visible: (record) =>
              !!this.syncAction.syncModelAction &&
              !this.executeInvisibleExpress(this.syncAction.syncModelAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncModelAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('界面部署'),
            icon: 'oinone-a-jiemiandaoru2x',
            visible: (record) =>
              !!this.syncAction.syncUiAction && !this.executeInvisibleExpress(this.syncAction.syncUiAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncUiAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('流程部署'),
            icon: 'oinone-a-liuchengdaoru2x',
            visible: (record) =>
              !!this.syncAction.syncWorkFlowAction &&
              !this.executeInvisibleExpress(this.syncAction.syncWorkFlowAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncWorkFlowAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('微流部署'),
            icon: 'oinone-a-liuchengdaoru2x',
            visible: (record) =>
              !!this.syncAction.syncMicroFlowAction &&
              !this.executeInvisibleExpress(this.syncAction.syncMicroFlowAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncMicroFlowAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('集成部署'),
            icon: 'oinone-a-jichengdaoru2x',
            visible: (record) =>
              !!this.syncAction.syncEipAction && !this.executeInvisibleExpress(this.syncAction.syncEipAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncEipAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('数据可视化部署'),
            icon: 'oinone-a-shujukeshihuadaoru2x',
            visible: (record) =>
              !!this.syncAction.syncDataAction &&
              !this.executeInvisibleExpress(this.syncAction.syncDataAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncDataAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          },
          {
            displayName: translateValueByKey('打印部署'),
            icon: 'oinone-a-jiemiandaoru2x',
            visible: (record) =>
              !!this.syncAction.syncPrintAction &&
              !this.executeInvisibleExpress(this.syncAction.syncPrintAction.invisible),
            exe: (record) => {
              executeViewAction(this.syncAction.syncPrintAction!, undefined, undefined, {
                module: record.module,
                moduleName: record.displayName
              });
            }
          }
        ]
      },
      {
        displayName: translateValueByKey('了解更多'),
        icon: 'oinone-gengduo',
        visible: (record) => this.actionPermission.hasDetailAction,
        exe: async (record) => {
          const model = await getModel('apps.AppsManagementModule');
          const action = model?.viewActionList?.filter((v) => v.name === 'apps_business_screen_detail')[0];
          if (action) {
            executeViewAction(
              CastHelper.cast(action),
              undefined,
              undefined,
              { appsManagementModule: {}, id: record.id, state: record.state },
              RedirectTargetEnum.BLANK
            );
          }
        }
      }
    ];
  }

  @Widget.Method()
  private async onLikeApp(module: string) {
    const body = `mutation {
      appSwitcherModuleProxyMutation {
        like(modules: [{ module: "${module}" }]) {
          id
        }
      }
    }`;

    await http.query('base', body);
  }

  @Widget.Method()
  private async onUnLikeApp(module: string) {
    const body = `mutation {
      appSwitcherModuleProxyMutation {
        unLike(modules: [{ module: "${module}" }]) {
          id
        }
      }
    }`;

    await http.query('base', body);
  }

  private async fetchTree({ displayName = '', like = 'ALL', status = 'ALL' }) {
    const body = `query {
      appsModuleCategoryProxyQuery {
        fetchCateTree(data: {displayName: "${displayName || ''}", like: ${like}, status: ${status} }) {
          id
          code
          name
          moduleNum
          sequence
          children {
            id
            name
            moduleNum
            code
            sequence
          }
        }
      }
    }`;
    const result = (await http.query('base', body)) as any;
    const arr = result.data.appsModuleCategoryProxyQuery.fetchCateTree || [];

    this.moduleCategory = arr
      .reduce((p, n) => {
        const children = n.children || [];
        return p.concat(...children);
      }, [])
      .sort((a, b) => a.sequence - b.sequence);
  }

  @Widget.Method()
  private async onChangeCategory(code?: string) {
    const pagination = this.generatorPagination();
    pagination.current = 1;
    if (code) {
      this.refreshProcess(new Condition('category').equal(code));
    } else {
      this.refreshProcess();
    }
  }

  public async queryPage<T = ActiveRecord>(
    condition: Condition,
    pagination: Pagination,
    sort: ISort[],
    variables: QueryVariables,
    context: QueryContext
  ): Promise<IQueryPageResult<T>> {
    const requestFields: IModelField[] = CastHelper.cast(
      ((await ModelCache.get(this.model.model))?.modelFields as RuntimeModelField[])?.filter((f) =>
        [
          'id',
          'displayName',
          'name',
          'module',
          'latestVersion',
          'application',
          'platformVersion',
          'logo',
          'canUpgrade',
          'state',
          'status',
          'like',
          'homepageViewId',
          'homepageViewSystemSource',
          'homePageModel',
          'moduleCategory',
          'description',
          'systemSource'
        ].includes(f.data)
      ) || []
    );
    const result = await customQueryPage<T>(
      this.loadFunctionNamespace,
      this.loadFunctionFun || FunctionMetadata.QUERY_PAGE_NAME,
      {
        currentPage: pagination.current,
        pageSize: this.showPagination ? pagination.pageSize : -1,
        sort: {
          sortField: 'createDate',
          direction: EDirection.DESC
        },
        condition: condition.toString() === DEFAULT_TRUE_CONDITION ? '' : condition
      },
      requestFields,
      requestFields,
      variables,
      context
    );
    this.fetchTree((this.searchBody || {}) as any);
    result.content?.forEach((a: any) => {
      a.stateDisplayName = AppStateDisplayNameENum[a.state] || '';
    });
    return result;
  }

  @Widget.Method()
  public async clickCreateViewAction() {
    this.initAppFormWidget(
      this.createAppDialogFormWidget,
      {},
      CreateAppForm,
      CreateAppFormXml,
      translateValueByKey('创建'),
      async (data) => {
        await insertOne(EditAppModelModel, data, undefined);
        this.refreshCallChaining?.syncCall();
        this.reloadAppFinder$.subject.next(true);
        OioNotification.success(translateValueByKey('成功'), translateValueByKey('创建成功'));
      }
    );
  }

  @Widget.Method()
  public async clickUpdateViewAction(record) {
    let data = {} as Record<string, any>;
    if (record.id) {
      data = await appQueryOne(record.id);
    }
    this.initAppFormWidget(
      this.updateAppDialogFormWidget,
      data,
      UpdateAppForm,
      UpdateAppFormXml,
      translateValueByKey('编辑'),
      async (e) => {
        await updateOne(EditAppModelModel, e, undefined);
        this.refreshCallChaining?.syncCall();
        OioNotification.success(translateValueByKey('成功'), translateValueByKey('更新成功'));
      }
    );
  }

  @Widget.Method()
  public async clickBindHomepageViewAction(record) {
    let data = {} as Record<string, any>;
    if (record.id) {
      data = await appQueryOne(record.id);
    }
    const { name: moduleName, homePageModel, homePageName } = data;
    let bindType: AppBindType = AppBindType.MENU;
    if (homePageModel && homePageName) {
      const moduleDefinition = await ModuleCache.get(moduleName);
      const bindHomePageMenu = moduleDefinition?.allMenus?.find((v) => {
        const { viewAction } = v;
        if (!viewAction) {
          return false;
        }
        const { model, name } = viewAction;
        return homePageModel === model && homePageName === name;
      });
      if (bindHomePageMenu) {
        data.bindHomePageMenu = bindHomePageMenu;
        data.bindHomePageModel = undefined;
        data.bindHomePageView = undefined;
      }
    }
    if (data.urlHomePage) {
      bindType = AppBindType.URL;
      data.bindHomePageModel = undefined;
      data.bindHomePageView = undefined;
    } else if (data.bindHomePageModel && data.bindHomePageView) {
      bindType = AppBindType.VIEW;
    }
    this.initAppFormWidget(
      this.bindAppHomepageDialogFormWidget,
      {
        ...data,
        bindType
      },
      BindAppHomepageForm,
      BindAppHomepageFormXml,
      translateValueByKey('设置首页'),
      async (result) => {
        if (result.bindType === 'MENU') {
          await bindHomePageByMenu(result.id, result.bindHomePageMenu?.id);
          OioNotification.success(translateValueByKey('成功'), translateValueByKey('绑定菜单成功'));
        } else if (result.bindType === 'VIEW') {
          await bindHomePageByView(result.id, result.bindHomePageView?.id);
          OioNotification.success(translateValueByKey('成功'), translateValueByKey('绑定视图成功'));
        } else if (result.bindType === 'URL') {
          await bindHomePageByURL(result.id, result.urlHomePage.url, result.urlHomePage.target);
          OioNotification.success(translateValueByKey('成功'), translateValueByKey('绑定链接成功'));
        }
      }
    );
  }

  @Widget.Method()
  public async bindAppHomepage() {
    return true;
  }

  public isPending = false;

  public async initAppFormWidget(widget, initData, viewName, xml, title, confirmFun) {
    if (this.isPending) {
      return;
    }

    try {
      this.isPending = true;

      if (widget) {
        widget.dispose();
      }
      const resView = await ViewCache.compile(EditAppModelModel, viewName, xml);
      if (!resView) {
        return;
      }
      resView.type = ViewType.Form;
      const runtimeContext = createRuntimeContextForWidget(resView!);
      const runtimeContextHandle = runtimeContext.handle;
      const dialogWidget = Dialog.create();
      dialogWidget.setWidth(600);
      dialogWidget.on('ok', async () => {
        const result = await widget?.validator();
        if (result) {
          await confirmFun(widget?.getData());
          dialogWidget.onVisibleChange(false);
        }
      });
      dialogWidget.on('cancel', () => {
        dialogWidget.onVisibleChange(false);
      });
      widget = dialogWidget.createWidget(FormWidget, undefined, {
        metadataHandle: runtimeContextHandle,
        rootHandle: runtimeContextHandle,
        template: runtimeContext.viewTemplate,
        dataSource: initData,
        activeRecords: initData,
        inline: true
      });
      dialogWidget.setTitle(title);
      dialogWidget.onVisibleChange(true);
    } finally {
      this.isPending = false;
    }
  }

  protected async mounted() {
    getModel(EditAppModelModel);
    ViewCache.compile(EditAppModelModel, CreateAppForm, CreateAppFormXml);
    ViewCache.compile(EditAppModelModel, UpdateAppForm, UpdateAppFormXml);
    ViewCache.compile(EditAppModelModel, BindAppHomepageForm, BindAppHomepageFormXml);

    this.addFormViewData =
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.model.model, 'construct', {})) || {};
  }
}

export default AppsGalleryWidget;

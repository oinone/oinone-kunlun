import { RuntimeContext, RuntimeServerAction, SubmitValue } from '@oinone/kunlun-engine';
import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { Condition, getSessionPath, GQL } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { BooleanHelper, GraphqlHelper, ReturnPromise, UrlHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActionWidget } from '../../../action';
import { ClickResult } from '../../../typing';
import { FILE_MODULE_NAME } from '../../constant';
import { AbstractTaskAction } from '../../task';
import { DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION } from '../constant';
import { ExcelExportService } from '../service';
import { ExcelExportMethodEnum, ExcelExportTask } from '../typing';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_ExportWorkbook }))
export class ExportWorkbookActionWidget extends AbstractTaskAction<ExcelExportTask> {
  protected get moduleName(): string {
    return FILE_MODULE_NAME;
  }

  @Widget.Reactive()
  protected get sync(): boolean {
    return BooleanHelper.isTrue(this.metadataRuntimeContext.viewAction?.template?.sync);
  }

  protected generatorGQLByTask(task: ExcelExportTask, condition: string | Condition): Promise<string> {
    let queryData = '{}';
    let rsql = condition;
    if (condition instanceof Condition) {
      const conditionBodyData = condition.getConditionBodyData();
      if (conditionBodyData && Object.keys(conditionBodyData).length) {
        queryData = GraphqlHelper.serializableObject(conditionBodyData);
      }
      rsql = condition.toString();
    }
    const conditionWrapper = condition
      ? {
          rsql,
          queryData
        }
      : undefined;

    const modelName = this.model.name || 'excelExportTask';
    return GQL.mutation(`${modelName}Mutation`, 'createExportTask')
      .buildRequest((builder) => {
        builder.buildObjectParameter('data', (builder) => {
          const { workbookDefinition, exportMethod, selectedFields } = task;
          builder.stringParameter('model', task.model);
          builder.booleanParameter('sync', true);
          if (workbookDefinition) {
            builder.buildObjectParameter('workbookDefinition', (builder) => {
              builder.stringParameter('id', workbookDefinition.id);
            });
          }
          if (conditionWrapper) {
            builder.buildObjectParameter('conditionWrapper', (builder) => {
              builder.stringParameter('rsql', conditionWrapper.rsql);
              builder.stringParameter('queryData', conditionWrapper.queryData);
            });
          }
          if (exportMethod) {
            builder.enumerationParameter('exportMethod', exportMethod);
          }
          if (selectedFields?.length) {
            builder.buildArrayParameter('selectedFields', selectedFields, (builder, value) => {
              builder.stringParameter('field', value.field);
              builder.stringParameter('displayName', value.displayName);
            });
          }
        });
      })
      .buildResponse((builder) => {
        builder.parameter('id');
      })
      .toString();
  }

  protected async createTask(
    searchRuntimeContext: RuntimeContext,
    task: ExcelExportTask,
    condition: string | Condition
  ): Promise<ExcelExportTask> {
    return ExcelExportService.createExportTaskByTask(this.model, task, condition, {
      requestFields: this.metadataRuntimeContext.getRequestModelFields(),
      variables: {
        path: this.getSessionPath()
      }
    });
  }

  protected getWorkbookId(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().workbookId || DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION);
  }

  protected async executeAction(action: RuntimeServerAction, parameters: SubmitValue): Promise<ClickResult> {
    const formData = (this.activeRecords?.[0] as ExcelExportTask) || {};
    let { exportMethod } = formData;
    if (!exportMethod) {
      exportMethod = ExcelExportMethodEnum.TEMPLATE;
    }
    let isNeedPrepare = false;
    let task: ExcelExportTask;
    switch (exportMethod) {
      case ExcelExportMethodEnum.TEMPLATE: {
        const workbookId = await this.getWorkbookId();
        if (!workbookId) {
          return false;
        }
        task = {
          ...formData,
          exportMethod: undefined,
          selectedFields: undefined,
          workbookDefinition: {
            id: workbookId
          }
        };
        break;
      }
      case ExcelExportMethodEnum.SELECT_TEMPLATE_FIELD: {
        const workbookId = await this.getWorkbookId();
        if (!workbookId) {
          return false;
        }
        task = {
          ...formData,
          workbookDefinition: {
            id: workbookId
          }
        } as ExcelExportTask;
        break;
      }
      case ExcelExportMethodEnum.SELECT_FIELD: {
        task = {
          ...formData,
          workbookDefinition: undefined
        };
        isNeedPrepare = true;
        break;
      }
      default:
        return false;
    }
    if (!task) {
      return false;
    }
    let condition: Condition | string | undefined;
    let searchRuntimeContext: RuntimeContext | undefined;
    const activeRecords = this.openerActiveRecords;
    if (activeRecords && activeRecords.length) {
      condition = `id =in= (${activeRecords.map((a) => a.id).join(',')})`;
    } else {
      const res = this.buildSearchConditions();
      if (res) {
        condition = res.condition;
        searchRuntimeContext = res.runtimeContext;
      }
    }
    if (!condition) {
      condition = DEFAULT_TRUE_CONDITION;
    }
    if (!searchRuntimeContext) {
      searchRuntimeContext = this.seekSearchRuntimeContext() || this.rootRuntimeContext;
    }
    if (isNeedPrepare) {
      return this.doTaskByPrepare(searchRuntimeContext, task, condition);
    }
    return this.doTask(searchRuntimeContext, task, condition);
  }

  protected async doTaskByPrepare(
    searchRuntimeContext: RuntimeContext,
    task: ExcelExportTask,
    condition: Condition | string
  ) {
    let data;
    let responseResult = false;
    if (this.sync) {
      const exportTask = await ExcelExportService.prepareCreateExportTask(
        this.model,
        {
          ...task,
          sync: true
        },
        condition,
        {
          requestFields: this.metadataRuntimeContext.getRequestModelFields(),
          variables: {
            path: this.getSessionPath()
          }
        }
      );
      const { requestId } = exportTask;
      if (!requestId) {
        OioNotification.error(this.translate('kunlun.common.error'));
        return false;
      }
      data = await this.generatorGQLByTaskByPrepare(requestId);
      const variables = {
        path: this.getSessionPath()
      };
      window.open(
        UrlHelper.appendBasePath(
          `/pamirs/${this.moduleName}?query=${encodeURIComponent(data)}&variables=${encodeURIComponent(
            JSON.stringify(variables)
          )}`
        ),
        '_blank'
      );
      responseResult = true;
    } else {
      data = await this.createTask(searchRuntimeContext, task, condition);
      responseResult = !!data.id;
    }
    return this.processResponseResult(searchRuntimeContext, task, responseResult);
  }

  protected generatorGQLByTaskByPrepare(requestId: string): Promise<string> {
    const modelName = this.model.name || 'excelExportTask';
    return GQL.mutation(modelName, 'createExportTask')
      .buildRequest((builder) => {
        builder.buildObjectParameter('data', (builder) => {
          builder.stringParameter('requestId', requestId);
          builder.booleanParameter('sync', true);
        });
      })
      .buildResponse((builder) => {
        builder.parameter('id');
      })
      .toString();
  }

  protected getSessionPath() {
    return this.action.sessionPath || this.viewAction?.sessionPath || getSessionPath();
  }

  /**
   * @deprecated please using sync
   */
  @Widget.Reactive()
  protected get syncExport() {
    return this.sync;
  }

  /**
   * @deprecated please using generatorGQLByTask
   */
  protected getUploadBodyGql(id, condition: string | Condition) {
    let queryData = '{}';
    let rsql = condition;
    if (condition instanceof Condition) {
      const conditionBodyData = condition.getConditionBodyData();
      if (conditionBodyData && Object.keys(conditionBodyData).length) {
        queryData = GraphqlHelper.serializableObject(conditionBodyData);
      }
      rsql = condition.toString();
    }

    const conditionWrapper = condition
      ? `,conditionWrapper:{
            rsql: "${rsql}",
            queryData: "${queryData}"
          }`
      : '';
    const modelName = this.model.name || 'excelExportTask';
    const mutation = `mutation {
      ${modelName}Mutation {
        createExportTask(data: {sync: true, workbookDefinition: {id: ${id}}${conditionWrapper}}) {
          id
          name
          state
        }
      }
    }`;

    return mutation;
  }

  /**
   * @deprecated please using generatorGQLByTask
   */
  protected async getUploadBodyGqlByTask(task: ExcelExportTask, condition: string | Condition) {
    return this.generatorGQLByTask(task, condition);
  }

  /**
   * @deprecated please using doTask
   */
  protected async doExport(runtimeContext: RuntimeContext, task: ExcelExportTask, condition: Condition | string) {
    return this.doTask(runtimeContext, task, condition);
  }
}

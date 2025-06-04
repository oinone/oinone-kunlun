import { RuntimeContext, RuntimeServerAction, SubmitValue } from '@oinone/kunlun-engine';
import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { Condition, GQL } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { BooleanHelper, GraphqlHelper, ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActionWidget } from '../../../action';
import { ClickResult } from '../../../typing';
import { AbstractTaskAction } from '../../task';
import { DEFAULT_PDF_DOCUMENT_ID_EXPRESSION } from '../constant';
import { PRINT_MODULE_NAME } from '../constant/module-name';
import { PrintService } from '../service';
import { PdfPrintTask } from '../typing';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_PrintPdfDocument }))
export class PrintPdfDocumentActionWidget extends AbstractTaskAction<PdfPrintTask> {
  protected get moduleName(): string {
    return PRINT_MODULE_NAME;
  }

  @Widget.Reactive()
  protected get sync(): boolean {
    return !BooleanHelper.isFalse(this.metadataRuntimeContext.viewAction?.template?.sync);
  }

  /**
   * 生成GQL
   * @param task 打印任务
   * @param condition 过滤表达式
   * @protected
   */
  protected async generatorGQLByTask(task: PdfPrintTask, condition: string | Condition) {
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

    return GQL.mutation(this.model.name || 'pdfPrintTask', 'createPrintTask')
      .buildRequest((builder) => {
        builder.buildObjectParameter('data', (builder) => {
          const { documentDefinitionId } = task;
          builder.stringParameter('model', task.model);
          builder.booleanParameter('sync', true);
          if (documentDefinitionId) {
            builder.stringParameter('documentDefinitionId', documentDefinitionId);
          }
          if (conditionWrapper) {
            builder.buildObjectParameter('conditionWrapper', (builder) => {
              builder.stringParameter('rsql', conditionWrapper.rsql);
              builder.stringParameter('queryData', conditionWrapper.queryData);
            });
          }
        });
      })
      .buildResponse((builder) => {
        builder.parameter('id', 'state');
      })
      .toString();
  }

  protected createTask(
    runtimeContext: RuntimeContext,
    task: PdfPrintTask,
    condition: string | Condition
  ): Promise<PdfPrintTask> {
    return PrintService.createPrintTaskByTask(this.model, task, condition, {
      requestFields: runtimeContext.getRequestModelFields()
    });
  }

  /**
   * 获取PDF文档定义ID
   * @protected
   */
  protected getDocumentDefinitionId(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().documentDefinitionId || DEFAULT_PDF_DOCUMENT_ID_EXPRESSION);
  }

  protected async executeAction(action: RuntimeServerAction, parameters: SubmitValue): Promise<ClickResult> {
    const formData = (this.activeRecords?.[0] as PdfPrintTask) || {};
    const documentDefinitionId = await this.getDocumentDefinitionId();
    if (!documentDefinitionId) {
      return false;
    }
    const task = {
      ...formData,
      documentDefinitionId
    };
    let condition: Condition | string | undefined;
    let runtimeContext: RuntimeContext | undefined;
    const activeRecords = this.openerActiveRecords;
    if (activeRecords && activeRecords.length) {
      condition = `id =in= (${activeRecords.map((a) => a.id).join(',')})`;
    } else {
      const res = this.buildSearchConditions();
      if (res) {
        condition = res.condition;
        runtimeContext = res.runtimeContext;
      }
    }
    if (!condition) {
      condition = DEFAULT_TRUE_CONDITION;
    }
    if (!runtimeContext) {
      runtimeContext = this.seekSearchRuntimeContext() || this.rootRuntimeContext;
    }
    return this.doTask(runtimeContext, task, condition);
  }
}

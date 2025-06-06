import { RuntimeServerAction, SubmitValue } from '@oinone/kunlun-engine';
import { ModelDefaultActionName, ModelFieldType } from '@oinone/kunlun-meta';
import { getSessionPath } from '@oinone/kunlun-request';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { createEasyImportTask, importTaskWithTableField } from '@oinone/kunlun-vue-ui-common';
import { isFunction } from 'lodash-es';
import { ActionWidget, ServerActionWidget } from '../../../action';
import { ClickResult } from '../../../typing';
import {
  DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION,
  DEFAULT_WORKBOOK_FILE_ID_EXPRESSION,
  DEFAULT_WORKBOOK_FILE_URL_EXPRESSION
} from '../constant';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_ImportWorkbook }))
export class ImportWorkbookActionWidget extends ServerActionWidget {
  protected list: Record<string, any>[] = [];

  protected getWorkbookId(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().workbookId || DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION);
  }

  protected getFileId(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().fileId || DEFAULT_WORKBOOK_FILE_ID_EXPRESSION);
  }

  protected getFileUrl(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().fileUrl || DEFAULT_WORKBOOK_FILE_URL_EXPRESSION);
  }

  protected async executeWithTableField({ workbookId, fileId, fileUrl, ttype }) {
    const methodName = ttype === ModelFieldType.OneToMany ? 'o2mImport' : 'm2mImport';

    const result = (await importTaskWithTableField(
      {
        id: workbookId,
        file: {
          id: fileId,
          url: fileUrl
        },
        methodName
      },
      {
        path: this.getSessionPath()
      }
    )) as { importDataList: string[] };

    this.list = result.importDataList.map((v) => JSON.parse(v));

    if (isFunction(this.onSubmit)) {
      this.onSubmit({
        parameters: {
          showRecords: this.list,
          submitRecords: this.list
        },
        action: this.action
      });
    }
  }

  protected async executeAction(action: RuntimeServerAction, parameters: SubmitValue): Promise<ClickResult> {
    const workbookId = this.getWorkbookId();
    if (!workbookId) {
      return false;
    }
    const fileId = this.getFileId();
    if (!fileId) {
      return false;
    }
    const fileUrl = this.getFileUrl();
    if (!fileUrl) {
      return false;
    }

    const ttype = this.metadataRuntimeContext.parentContext?.parentContext?.field?.ttype;

    if (ttype && [ModelFieldType.OneToMany, ModelFieldType.ManyToMany].includes(ttype)) {
      await this.executeWithTableField({
        ttype,
        workbookId,
        fileId,
        fileUrl
      });
    } else {
      await createEasyImportTask(
        workbookId,
        {
          id: fileId,
          url: fileUrl
        },
        {
          path: this.getSessionPath()
        }
      );
    }

    OioNotification.success(this.translate('kunlun.common.success'));

    return true;
  }

  protected getSessionPath() {
    return this.action.sessionPath || this.viewAction?.sessionPath || getSessionPath();
  }
}

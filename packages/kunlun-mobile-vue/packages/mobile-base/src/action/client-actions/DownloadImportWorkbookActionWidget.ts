import { ModelDefaultActionName } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { getEasyImportTemplate } from '@kunlun/vue-ui-mobile-vant';
import { ActionWidget } from '../component';
import { UrlActionWidget } from '../url-actions';
import { DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION } from './constant';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_DownloadImportWorkbook }))
export class DownloadImportWorkbookActionWidget extends UrlActionWidget {
  protected getWorkbookId(): ReturnPromise<string | undefined> {
    return this.executeExpression<string>(this.getDsl().workbookId || DEFAULT_WORKBOOK_DEFINITION_ID_EXPRESSION);
  }

  protected async getUrl() {
    const workbookId = this.getWorkbookId();
    if (!workbookId) {
      return undefined;
    }
    return (await getEasyImportTemplate(workbookId)).redirectUri as string;
  }
}

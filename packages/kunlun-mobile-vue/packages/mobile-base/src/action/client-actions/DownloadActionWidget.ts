import { ModelDefaultActionName } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_Download }))
export class DownloadActionWidget extends ActionWidget {
  protected async downloadUrl(url: string) {
    const result = await fetch(url);
    const blob = await result.blob();

    const a = document.createElement('a');
    a.setAttribute('href', URL.createObjectURL(blob));
    a.setAttribute('download', '');
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }

  protected async clickAction() {
    const records = this.activeRecords || [];
    const downloadKey = this.getDsl().downloadKey || 'url';

    Promise.all(records.filter((r) => r[downloadKey]).map((r: any) => this.downloadUrl(r[downloadKey])));
  }
}

import { ModelDefaultActionName } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_EditOne }))
export class TableEditOneAction extends ActionWidget {
  protected async clickAction() {
    console.log('edit');
  }
}

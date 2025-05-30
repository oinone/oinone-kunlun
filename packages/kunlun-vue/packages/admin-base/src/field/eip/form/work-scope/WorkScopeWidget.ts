import { ModelFieldType, ViewType } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import WorkScope from './WorkScope.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'WorkScopeWidget'
  })
)
export class WorkScopeWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(WorkScope);
    return this;
  }

  protected mountedProcess(): ReturnPromise<void> {
    return undefined;
  }
}

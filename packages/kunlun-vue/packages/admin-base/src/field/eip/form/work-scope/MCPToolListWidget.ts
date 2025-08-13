import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import MCPToolList from './MCPToolList.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'MCPToolListWidget'
  })
)
export class MCPToolListWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MCPToolList);
    return this;
  }

  protected mountedProcess(): ReturnPromise<void> {
    return undefined;
  }
}

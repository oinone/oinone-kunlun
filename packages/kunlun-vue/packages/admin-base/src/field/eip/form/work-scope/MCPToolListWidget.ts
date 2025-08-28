import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-dependencies';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import MCPToolList from './MCPToolList.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
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

  @Widget.Reactive()
  public get readonly() {
    return this.viewType === ViewType.Detail;
  }
}

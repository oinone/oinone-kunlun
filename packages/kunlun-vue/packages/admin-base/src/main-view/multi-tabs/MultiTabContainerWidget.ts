import { MultiTabInstance, MultiTabWidget, RuntimeContextManager } from '@oinone/kunlun-engine';
import { MetadataViewWidget, MetadataViewWidgetProps } from '../../basic';

export interface MultiTabContainerWidgetProps extends MetadataViewWidgetProps {
  instance: MultiTabInstance;
}

export class MultiTabContainerWidget
  extends MetadataViewWidget<MultiTabContainerWidgetProps>
  implements MultiTabWidget
{
  protected instance!: MultiTabInstance;

  public initialize(props: MultiTabContainerWidgetProps) {
    super.initialize(props);
    this.instance = props.instance;
    return this;
  }

  public onRefresh(handle: string | undefined) {
    if (!handle) {
      handle = this.metadataHandle;
    }
    const runtimeContext = RuntimeContextManager.get(handle);
    if (runtimeContext) {
      const cloneRuntimeContext = RuntimeContextManager.createOrReplace(
        this.currentHandle,
        RuntimeContextManager.get()
      );
      runtimeContext.transfer(cloneRuntimeContext);
      this.initContext(cloneRuntimeContext);
    }
  }

  protected getWidgetComponentName() {
    return this.instance.key;
  }

  public dispose() {
    super.dispose(true);
    this.instance.widget = null;
  }
}

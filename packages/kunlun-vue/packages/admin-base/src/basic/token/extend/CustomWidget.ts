import { BaseElementViewWidget } from '../../element';

export class CustomWidget extends BaseElementViewWidget {
  protected async mountedProcess(): Promise<void> {}

  protected async refreshProcess(): Promise<void> {}
}

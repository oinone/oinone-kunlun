import {
  getReloadMainViewParameters,
  getReloadMaskParameters,
  ReloadMainViewCallChainingParameters,
  ReloadMaskCallChainingParameters
} from '@oinone/kunlun-engine';
import { CallChaining, ReturnPromise } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseMaskWidget } from './token';

export abstract class MaskWidget extends BaseMaskWidget {
  public get path(): string {
    return this.currentHandle;
  }

  protected reloadMaskProcess?(reloadParameters: ReloadMaskCallChainingParameters): ReturnPromise<void>;

  protected reloadMainViewProcess?(reloadParameters: ReloadMainViewCallChainingParameters): ReturnPromise<void>;

  @Widget.Reactive()
  @Widget.Inject()
  protected reloadMaskCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected reloadMainViewCallChaining: CallChaining | undefined;

  protected hookReloadMaskProcess() {
    if (this.reloadMaskProcess) {
      this.reloadMaskCallChaining?.hook(this.path, async (args) => {
        const reloadParameters = getReloadMaskParameters(args);
        this.reloadMaskProcess?.(reloadParameters);
      });
    }
  }

  protected hookReloadMainViewProcess() {
    if (this.reloadMainViewProcess) {
      this.reloadMainViewCallChaining?.hook(this.path, async (args) => {
        const reloadParameters = getReloadMainViewParameters(args);
        this.reloadMainViewProcess?.(reloadParameters);
      });
    }
  }

  protected hookMount() {
    this.hookReloadMaskProcess();
    this.hookReloadMainViewProcess();
  }

  protected hookUnmount() {
    if (this.reloadMaskProcess) {
      this.reloadMaskCallChaining?.unhook(this.path);
    }
    if (this.reloadMainViewProcess) {
      this.reloadMainViewCallChaining?.unhook(this.path);
    }
  }

  protected $$mounted() {
    super.$$mounted();
    this.hookMount();
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.hookUnmount();
  }

  public dispose() {
    super.dispose();
    this.hookUnmount();
  }
}

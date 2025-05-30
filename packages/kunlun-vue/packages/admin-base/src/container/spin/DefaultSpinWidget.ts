import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { VNode } from 'vue';
import { BasePackWidget } from '../../basic';
import DefaultSpin from './DefaultSpin.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'spin' }))
export class DefaultSpinWidget extends BasePackWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSpin);
    return this;
  }

  @Widget.Reactive()
  protected internalLoadingIndicator: VNode | undefined;

  @Widget.Reactive()
  public get loadingIndicator() {
    return this.internalLoadingIndicator;
  }

  public set loadingIndicator(loadingIndicator: VNode | undefined) {
    this.internalLoadingIndicator = loadingIndicator;
  }

  @Widget.Reactive()
  protected internalWrapperClassName: string | string[] | undefined;

  @Widget.Reactive()
  public get wrapperClassName() {
    return this.internalWrapperClassName || this.getDsl().wrapperClassName;
  }

  public set wrapperClassName(wrapperClassName: string | string[] | undefined) {
    this.internalWrapperClassName = wrapperClassName;
  }

  @Widget.Reactive()
  protected internalSize: string | undefined;

  @Widget.Reactive()
  public get size(): string | undefined {
    return this.internalSize || this.getDsl().size;
  }

  public set size(size: string | undefined) {
    this.internalSize = size;
  }

  @Widget.Reactive()
  protected internalDelay: number | undefined;

  @Widget.Reactive()
  public get delay(): number | undefined {
    return this.internalDelay || this.getDsl().delay;
  }

  public set delay(delay: number | undefined) {
    this.internalDelay = delay;
  }

  @Widget.Reactive()
  protected internalTip: number | undefined;

  @Widget.Reactive()
  public get tip(): number | undefined {
    return this.internalTip || this.getDsl().tip;
  }

  public set tip(tip: number | undefined) {
    this.internalTip = tip;
  }

  @Widget.Method()
  @Widget.Provide()
  public async load<R>(fn: (...args) => R, ...args): Promise<R> {
    return super.load(fn, ...args);
  }
}

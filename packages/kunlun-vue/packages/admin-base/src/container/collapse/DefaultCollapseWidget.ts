import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioCollapseExpandIconPosition, OioCollapseMethod, OioCollapseType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultCollapse from './DefaultCollapse.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'collapse' }))
export class DefaultCollapseWidget extends BasePackWidget {
  protected defaultAllInvisible = false;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCollapse);
    return this;
  }

  @Widget.Reactive()
  private activeKey: string | string[] | undefined;

  public getActiveKey() {
    return this.activeKey;
  }

  public setActiveKey(key: string | string[] | undefined) {
    this.activeKey = key;
  }

  @Widget.Method()
  public onActiveKeyChange(key: string | string[]) {
    this.setActiveKey(key);
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get expandAll(): boolean | undefined {
    const { expandAll } = this.getDsl();
    if (isNil(expandAll)) {
      return true;
    }
    return BooleanHelper.toBoolean(expandAll);
  }

  @Widget.Reactive()
  protected get type(): string {
    return this.getDsl().type?.toLowerCase?.() || OioCollapseType.bordered;
  }

  @Widget.Reactive()
  protected get collapseMethod(): string {
    return this.getDsl().collapseMethod?.toLowerCase?.() || OioCollapseMethod.default;
  }

  @Widget.Reactive()
  public get accordion(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().accordion);
  }

  @Widget.Reactive()
  protected get expandIconPosition() {
    return this.getDsl()?.expandIconPosition?.toLowerCase() || OioCollapseExpandIconPosition.right;
  }
}

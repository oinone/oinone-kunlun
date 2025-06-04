import { SPI } from '@oinone/kunlun-spi';
import { DEFAULT_TAB_TITLE } from '@oinone/kunlun-vue-ui-mobile-vant';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultTab from './DefaultTab.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'tab' }))
export class DefaultTabWidget extends BasePackWidget {
  public initialize(props) {
    if (!props.template) {
      props.template = props.dslDefinition;
    }
    super.initialize(props);
    this.setComponent(DefaultTab);
    return this;
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
  public get key() {
    return this.currentHandle;
  }

  @Widget.Reactive()
  public get title() {
    const { title } = this.getDsl();
    return title ? this.executeLabelExpression(title as string)! : DEFAULT_TAB_TITLE;
  }

  @Widget.Reactive()
  public get disabled(): boolean {
    const { disabled } = this.getDsl();
    if (disabled == null) {
      return false;
    }
    if (isString(disabled)) {
      return !!this.executeExpression<boolean>(disabled, false);
    }
    return !!disabled;
  }

  @Widget.Reactive()
  public get forceRender() {
    return true;
  }
}

import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultGroup from './DefaultGroup.vue';

const TITLE_TOOLBAR_SLOT_NAME = 'titleToolbar';

@SPI.ClassFactory(BasePackWidget.Token({}))
export class DefaultGroupWidget extends BasePackWidget {
  /**
   * @deprecated 不允许通过api设置title
   */
  public setTitle(title: string) {
    const dsl = this.getDsl();
    if (dsl) {
      dsl.title = title;
    }
  }

  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME, TITLE_TOOLBAR_SLOT_NAME];
    }
    super.initialize(props);
    this.setComponent(DefaultGroup);
    return this;
  }

  @Widget.Reactive()
  public get title() {
    const title = this.getDsl().title || '';
    return this.executeLabelExpression(title as string);
  }

  @Widget.Reactive()
  public get description(): string {
    return this.getDsl().desc || '';
  }

  @Widget.Reactive()
  public get border() {
    let border = BooleanHelper.toBoolean(this.getDsl().border);
    if (isNil(border)) {
      border = !this.isDialog && !this.isDrawer;
    }
    return border;
  }

  @Widget.Reactive()
  public get help() {
    return this.executeExpression(this.getDsl().help as string, this.getDsl().help);
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }
}

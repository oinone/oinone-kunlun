import { DEFAULT_SLOT_NAME } from '@oinone/kunlun-dsl';
import { isMinimalismTheme } from '@oinone/kunlun-engine';
import { BooleanHelper, CSSClass, CSSStyle } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultGroup from './DefaultGroup.vue';

const TITLE_TOOLBAR_SLOT_NAME = 'titleToolbar';

@SPI.ClassFactory(BasePackWidget.Token({}))
export class DefaultGroupWidget extends BasePackWidget {
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
  public get bizStyle(): string | undefined {
    const { bizStyle } = this.getDsl();
    if (bizStyle) {
      return bizStyle;
    }
    if (isMinimalismTheme()) {
      return 'style1';
    }
    return undefined;
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
  public get wrapperClassName(): CSSClass | undefined {
    return this.getDsl().wrapperClassName;
  }

  @Widget.Reactive()
  public get wrapperStyle(): string | Partial<CSSStyle> | undefined {
    return this.getDsl().wrapperStyle;
  }

  @Widget.Reactive()
  public get toolbarClassName(): CSSClass | undefined {
    return this.getDsl().toolbarClassName;
  }

  @Widget.Reactive()
  public get toolbarStyle(): string | Partial<CSSStyle> | undefined {
    return this.getDsl().toolbarStyle;
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

  /**
   * @deprecated 不允许通过api设置title
   */
  public setTitle(title: string) {
    const dsl = this.getDsl();
    if (dsl) {
      dsl.title = title;
    }
  }
}

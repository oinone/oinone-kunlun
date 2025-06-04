import { RedirectTargetEnum } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { createVNode, VNode, withModifiers } from 'vue';
import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Table],
    ttype: ModelFieldType.String,
    widget: 'Hyperlinks'
  })
)
export class TableHyperlinksFieldWidget extends BaseTableFieldWidget {
  @Widget.Reactive()
  public get text() {
    return this.getDsl().text;
  }

  @Widget.Reactive()
  public get target() {
    const { target } = this.getDsl();
    if (target) {
      switch (target as ViewActionTarget) {
        case ViewActionTarget.Router:
          return RedirectTargetEnum.SELF;
        case ViewActionTarget.OpenWindow:
          return RedirectTargetEnum.BLANK;
        default:
          return RedirectTargetEnum.BLANK;
      }
    }
    return RedirectTargetEnum.BLANK;
  }

  @Widget.Reactive()
  protected get defaultValue() {
    return this.getDsl().defaultValue;
  }

  @Widget.Method()
  public renderDefaultSlot(context): VNode[] | string {
    const currentValue = this.compute(context);
    return [
      createVNode(
        'div',
        {
          class: 'mobile-default-table-hyperlinks',
          onClick: withModifiers(() => {}, ['stop'])
        },
        [
          createVNode(
            'a',
            { href: currentValue, target: this.target, title: currentValue },
            this.text || currentValue || this.defaultValue
          )
        ]
      )
    ];
  }
}

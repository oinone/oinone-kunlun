import { deepClone, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget, BaseFieldProps } from '../../basic';
import DefaultCardTitle from './DefaultCardTitle.vue';
import { isEmptyObject } from '../../layout';
import { DetailCommonFieldWidget } from '../../field';
import { Component, createVNode, Slots, VNode } from 'vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'card-title'
  })
)
export class CardTitleWidget extends BaseElementWidget {
  @Widget.Reactive()
  protected fieldWidgetList = [] as DetailCommonFieldWidget[];

  protected slotMap = {} as any;

  @Widget.Reactive()
  protected get visibleFieldList() {
    // const list = this.fieldWidgetList.filter((a) => !a.getFieldWidget()?.invisible && !isEmptyObject(a.getFieldWidget()?.getValue()));
    const list = this.fieldWidgetList.filter((a) => !a?.invisible && !isEmptyObject(a?.getValue()));
    this.onHideTitle?.(!list.length);
    // return this.fieldWidgetList;
    return list;
  }

  @Widget.Reactive()
  protected get firstVisibleField() {
    return this.visibleFieldList?.[0];
  }

  @Widget.Reactive()
  protected get lastVisibleField() {
    return this.visibleFieldList?.[this.visibleFieldList.length - 1];
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected onHideTitle;

  public initialize(props) {
    const template = props.template!;
    const widgets = deepClone(template.widgets);
    template.widgets = [];
    props.internal = true;

    super.initialize(props);
    this.setComponent(DefaultCardTitle);

    this.fieldWidgetList?.forEach((a) => a.dispose());
    this.fieldWidgetList = [];
    if (widgets) {
      const path = this.path ? `${this.path}.` : '';
      widgets?.forEach((field, index) => {
        const fieldConfig = {
          field,
          viewType: ViewType.Gallery,
          template: field as any,
          activeRecords: this.activeRecords,
          rootHandle: this.rootHandle
        } as BaseFieldProps;
        const slotName = `cardTitle${field.name}`;
        const fieldWidget = this.createWidget(new DetailCommonFieldWidget(), slotName, fieldConfig);
        this.fieldWidgetList.push(fieldWidget);
        this.slotMap[slotName] = () => fieldWidget.render();
      });
    }
    return this;
  }

  protected renderWidgetComponent(widgetComponent: Component, context?: Record<string, unknown>, slots?: Slots): VNode {
    return createVNode(
      widgetComponent,
      {},
      {
        ...slots,
        ...this.slotMap
      }
    );
  }
}

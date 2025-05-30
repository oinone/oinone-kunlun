import { IPopupInstance, IWidget, PopupManager, PopupType, ROOT_HANDLE } from '@kunlun/engine';
import {
  CLICK_ACTIVATED_CLASS,
  createVisibleArea,
  RuntimeEnvironmentManager,
  useEnv,
  VisibleArea
} from '@kunlun/environment';
import { EventBus, EventConsumer, EventMessage } from '@kunlun/event';
import { SPIFactory } from '@kunlun/spi';
import { VueWidget, Widget } from '@kunlun/vue-widget';
import { ComponentInternalInstance, VNode } from 'vue';
import { BaseView } from '../../basic';
import { RootComponentSPI } from '../../spi';
import { PopupWidget } from '../../view';

type MaybeVNodeDom = HTMLElement & {
  __vnode?: VNode;
  __vueParentComponent?: ComponentInternalInstance | null;
};

type WidgetCollection = {
  widgets: IWidget[];
  viewWidgets: WidgetEntity[];
};

type WidgetEntity = {
  widget: IWidget;
  range: VisibleArea;
  index: number;
};

@SPIFactory.Register(RootComponentSPI.Token({ widget: 'environment' }))
export class EnvironmentWidget extends VueWidget {
  protected mousedownEventConsumer?: EventConsumer;

  protected mouseupEventConsumer?: EventConsumer;

  protected mousemoveEventConsumer?: EventConsumer;

  protected get maxOffsetX(): number {
    return 5;
  }

  protected get maxOffsetY(): number {
    return 5;
  }

  private mousedownActive = false;

  private pointRecord: { x: number; y: number } | undefined;

  private addedActivatedClassEls: HTMLElement[] = [];

  protected onMouseClick(self: EventConsumer, message: EventMessage<PointerEvent>) {
    const { origin } = message;
    const target = origin.target as MaybeVNodeDom;
    const res = this.collectionComponentInstances(target);
    if (!res) {
      return;
    }
    const { viewWidgets } = res;
    this.clearClickActivatedClass();
    const { addedActivatedClassEls, clickVisibleArea } = this.refreshClickActivatedClass(viewWidgets);
    const env = useEnv();
    this.addedActivatedClassEls = addedActivatedClassEls;
    env.clickVisibleArea = clickVisibleArea;
  }

  protected clearClickActivatedClass() {
    for (const addedActivatedClassEl of this.addedActivatedClassEls) {
      addedActivatedClassEl?.classList?.remove(CLICK_ACTIVATED_CLASS);
    }
  }

  // fixme @zbh 20241215 此处应做差量计算，避免重复移除和添加操作
  protected refreshClickActivatedClass(viewWidgets: WidgetEntity[]) {
    const addedActivatedClassEls: HTMLElement[] = [];
    const clickVisibleArea: VisibleArea[] = [];
    for (const { range } of viewWidgets) {
      const { el } = range;
      if (el) {
        el.classList.add(CLICK_ACTIVATED_CLASS);
        addedActivatedClassEls.push(el);
        clickVisibleArea.push(range);
      }
    }
    return {
      clickVisibleArea,
      addedActivatedClassEls
    };
  }

  protected collectionComponentInstances(target: MaybeVNodeDom): WidgetCollection | undefined {
    const { handle } = target.dataset;
    if (handle) {
      const widget = Widget.select(handle);
      if (widget) {
        return this.$$collectionWidgetCollection(widget);
      }
    }
    let parentElement = target.parentElement as MaybeVNodeDom;
    while (parentElement) {
      const { handle } = parentElement.dataset;
      if (handle) {
        const widget = Widget.select(handle);
        if (widget) {
          return this.$$collectionWidgetCollection(widget);
        }
      }
      parentElement = parentElement.parentElement as MaybeVNodeDom;
    }
    return undefined;
  }

  protected $$collectionWidgetCollection(widget: IWidget) {
    const widgets: IWidget[] = [];
    const viewWidgets: WidgetEntity[] = [];
    const push = (target: IWidget, index: number): { interrupt: boolean; addIndex: boolean } => {
      const handle = target.getHandle();
      widgets.push(target);
      if (target instanceof BaseView) {
        const el = document.getElementById(target.getHandle());
        if (el) {
          viewWidgets.push({
            widget: target,
            range: createVisibleArea(handle, el),
            index
          });
        }
      } else if (target instanceof PopupWidget) {
        const instance = PopupManager.INSTANCE.getInstance(target.getHandle());
        if (instance) {
          const el = document.querySelector<HTMLElement>(
            this.generatorPopupWidgetContentSelector(instance.key, instance.type)
          );
          if (el) {
            viewWidgets.push({
              widget: target,
              range: createVisibleArea(handle, el),
              index
            });
          }
        }
        return {
          interrupt: true,
          addIndex: false
        };
      }
      return { interrupt: false, addIndex: true };
    };
    let index = 0;
    const { interrupt, addIndex } = push(widget, index);
    if (interrupt) {
      return {
        widgets,
        viewWidgets
      };
    }
    if (addIndex) {
      index++;
    }
    let parent = widget.getParent();
    while (parent) {
      const { interrupt, addIndex } = push(parent, index);
      if (interrupt) {
        break;
      }
      if (addIndex) {
        index++;
      }
      parent = parent.getParent();
    }
    return {
      widgets,
      viewWidgets
    };
  }

  protected getWidgetHandle(target: ComponentInternalInstance): string | undefined {
    if (!!target.vnode?.el) {
      return (target.props.currentHandle as string) || (target.attrs.currentHandle as string);
    }
    return undefined;
  }

  protected getWidgetProp(target: ComponentInternalInstance, key: string): string | undefined {
    return (target.props[key] as string) || (target.attrs[key] as string);
  }

  protected onMousedown(self: EventConsumer, message: EventMessage<PointerEvent>) {
    const { origin } = message;
    const { clientX, clientY } = origin;
    this.mousedownActive = true;
    this.onMousemove(self, message);
    this.pointRecord = {
      x: clientX,
      y: clientY
    };
  }

  protected onMouseup(self: EventConsumer, message: EventMessage<PointerEvent>) {
    const { mousedownActive, pointRecord, maxOffsetX, maxOffsetY } = this;
    const { origin } = message;
    const { clientX, clientY } = origin;
    if (mousedownActive && pointRecord) {
      const offsetX = Math.abs(clientX - pointRecord.x);
      const offsetY = Math.abs(clientY - pointRecord.y);
      if (offsetX <= maxOffsetX && offsetY <= maxOffsetY) {
        this.onMouseClick(self, message);
      }
    }
    this.mousedownActive = false;
    this.pointRecord = undefined;
  }

  protected onMousemove(self: EventConsumer, message: EventMessage<PointerEvent>) {
    const { origin } = message;
    const env = useEnv();
    env.mcx = origin.clientX;
    env.mcy = origin.clientY;
    const contentDom = env.getContentHTMLElement();
    env.st = contentDom?.scrollTop || 0;
    env.sl = contentDom?.scrollLeft || 0;
  }

  protected onPopupOpen(manager: PopupManager, instance: IPopupInstance) {
    const { key } = instance;
    const env = RuntimeEnvironmentManager.createOrReplace(key, useEnv());
    env.contentSelector = this.generatorPopupWidgetContentSelector(key, instance.type);
    RuntimeEnvironmentManager.select(key);
  }

  protected generatorPopupWidgetContentSelector(key: string, type: PopupType): string {
    switch (type) {
      case 'dialog':
        return `#${key} .ant-modal-content`;
    }
    return `#${key}`;
  }

  protected onPopupClose(manager: PopupManager, instance: IPopupInstance) {
    const { key } = instance;
    const env = RuntimeEnvironmentManager.get(key);
    RuntimeEnvironmentManager.select(env?.parentContext?.handle || ROOT_HANDLE);
    RuntimeEnvironmentManager.delete(instance.key);
  }

  protected $$mounted() {
    this.mousedownEventConsumer = EventBus.subscribeHTMLEvent('mousedown', this.onMousedown.bind(this));
    this.mouseupEventConsumer = EventBus.subscribeHTMLEvent('mouseup', this.onMouseup.bind(this));
    // this.mousemoveEventConsumer = EventBus.subscribeHTMLEvent('mousemove', this.onMousemove.bind(this));
    PopupManager.INSTANCE.onOpen(this.onPopupOpen.bind(this));
    PopupManager.INSTANCE.onClose(this.onPopupClose.bind(this));
    PopupManager.INSTANCE.onDispose(this.onPopupClose.bind(this));
  }

  protected $$unmounted() {
    this.mousedownEventConsumer?.dispose();
    this.mouseupEventConsumer?.dispose();
    this.mousemoveEventConsumer?.dispose();
    PopupManager.INSTANCE.clearOnOpen(this.onPopupOpen.bind(this));
    PopupManager.INSTANCE.clearOnClose(this.onPopupClose.bind(this));
    PopupManager.INSTANCE.clearOnDispose(this.onPopupClose.bind(this));
  }
}

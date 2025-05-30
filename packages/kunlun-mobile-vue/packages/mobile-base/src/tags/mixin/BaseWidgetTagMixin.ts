import { DEFAULT_SLOT_NAME, DslDefinition } from '@kunlun/dsl';
import { Optional } from '@kunlun/shared';
import {
  DslRender,
  RenderWidget,
  renderWidgets,
  reportAllMounted,
  VueWidget,
  WidgetTagProps
} from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { ComponentOptionsMixin, computed, Slots } from 'vue';
import { useInjectMetaContext, useProviderMetaContext } from '../context';
import { createCustomWidget, CustomWidgetProps, InternalWidget } from '../resolve';
import { BaseWidgetTagMixinContext } from './typing';

/**
 * 组件可选项合并混入可选项
 * 使用此混入方式，必须重写{@link methods#getWidgetTag}方法
 */
export const BaseWidgetTagMixin: ComponentOptionsMixin = {
  props: {
    ...WidgetTagProps
  },
  methods: {
    getWidgetTag(): InternalWidget | string {
      throw new Error(`The method 'getWidgetTag' must be overridden.`);
    },
    getMetadataHandle(): string {
      return useInjectMetaContext().metadataHandle.value;
    },
    getRootHandle(): string {
      return useInjectMetaContext().rootHandle.value;
    },
    getParentHandle(): string {
      return useInjectMetaContext().parentHandle.value;
    },
    getDslDefinition(): DslDefinition | undefined {
      return this.dslDefinition || this.$attrs;
    },
    getSlotName(): string {
      return this.slotName || DEFAULT_SLOT_NAME;
    },
    getInline(): boolean {
      if (isNil(this.inline)) {
        return useInjectMetaContext().inline.value;
      }
      return this.inline;
    },
    getCustomProps(): Record<string, unknown> {
      return {};
    },
    getProps(): CustomWidgetProps {
      return {
        ...this.$attrs,
        template: this.getDslDefinition(),
        metadataHandle: this.getMetadataHandle(),
        rootHandle: this.getRootHandle(),
        parentHandle: this.getParentHandle(),
        slotName: this.getSlotName(),
        inline: this.getInline(),
        widgetInline: this.getInline(),
        ...this.getCustomProps()
      } as CustomWidgetProps;
    },
    getCurrentSlots(): Slots | undefined {
      return (
        DslRender.fetchVNodeSlots(this.dslDefinition || this.$attrs) ||
        (Object.keys(this.$slots).length ? this.$slots : undefined)
      );
    },
    createWidget(): RenderWidget | undefined {
      return createCustomWidget(this.getWidgetTag(), this.getProps());
    }
  },
  data() {
    reportAllMounted();
    const metaContext = useInjectMetaContext();
    const renderWidget = this.createWidget();
    if (!renderWidget) {
      console.error(`Invalid custom widget.`, this.getWidgetTag(), this.getProps());
      return {
        widgetHandle: '',
        widgets: [],
        currentSlots: this.getCurrentSlots()
      };
    }
    const { handle: widgetHandle, widgets } = renderWidget;
    useProviderMetaContext({
      ...metaContext,
      parentHandle: computed(() => widgetHandle),
      slotName: computed(() => this.getSlotName()),
      inline: computed(() => Optional.ofNullable(this.inline).orElse(metaContext.inline.value))
    });
    return {
      widgetHandle,
      widgets,
      currentSlots: this.getCurrentSlots()
    };
  },
  render(ctx: BaseWidgetTagMixinContext) {
    return renderWidgets(ctx.widgets as VueWidget[], ctx, ctx.getCurrentSlots());
  }
};

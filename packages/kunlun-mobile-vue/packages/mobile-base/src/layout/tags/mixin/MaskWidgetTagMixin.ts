import { DEFAULT_SLOT_NAME, DslDefinition } from '@kunlun/dsl';
import {
  DslRender,
  RenderWidget,
  renderWidgets,
  reportAllMounted,
  VueWidget,
  WidgetTagProps
} from '@kunlun/vue-widget';
import { ComponentOptionsMixin, computed, Slots } from 'vue';
import { useInjectMaskContext, useProviderMaskContext } from '../context';
import { createMaskWidget, CreateMaskWidgetProps, InternalMaskWidget } from '../resolve';
import { MaskWidgetTagMixinContext } from './typing';

export const MaskWidgetTagMixin: ComponentOptionsMixin = {
  props: {
    ...WidgetTagProps
  },
  methods: {
    getWidgetTag(): InternalMaskWidget | string {
      throw new Error(`The method 'getWidgetTag' must be overridden.`);
    },
    getParentHandle(): string {
      return useInjectMaskContext().parentHandle.value;
    },
    getDslDefinition(): DslDefinition | undefined {
      return this.dslDefinition || this.$attrs;
    },
    getSlotName(): string {
      return this.slotName || DEFAULT_SLOT_NAME;
    },
    getCustomProps(): Record<string, unknown> {
      return {};
    },
    getProps(): CreateMaskWidgetProps {
      return {
        ...this.$attrs,
        template: this.getDslDefinition(),
        parentHandle: this.getParentHandle(),
        slotName: this.getSlotName(),
        ...this.getCustomProps()
      } as CreateMaskWidgetProps;
    },
    getCurrentSlots(): Slots | undefined {
      return (
        DslRender.fetchVNodeSlots(this.dslDefinition || this.$attrs) ||
        (Object.keys(this.$slots).length ? this.$slots : undefined)
      );
    },
    createWidget(): RenderWidget | undefined {
      return createMaskWidget(this.getWidgetTag(), this.getProps());
    }
  },
  data() {
    reportAllMounted();
    const metaContext = useInjectMaskContext();
    const customWidget = this.createWidget();
    if (!customWidget) {
      console.error(`Invalid custom widget.`, this.getWidgetTag(), this.getProps());
      return {
        widgetHandle: '',
        widgets: [],
        currentSlots: this.getCurrentSlots()
      };
    }
    const { handle: widgetHandle, widgets } = customWidget;
    useProviderMaskContext({
      ...metaContext,
      parentHandle: computed(() => widgetHandle),
      slotName: computed(() => this.getSlotName())
    });
    return {
      widgetHandle,
      widgets,
      currentSlots: this.getCurrentSlots()
    };
  },
  render(ctx: MaskWidgetTagMixinContext) {
    return renderWidgets(ctx.widgets as VueWidget[], ctx, ctx.getCurrentSlots());
  }
};

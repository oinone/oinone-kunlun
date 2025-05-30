import { DEFAULT_SLOT_NAME, DslDefinition } from '@kunlun/dsl';
import {
  DslRender,
  RenderWidget,
  renderWidgets,
  reportAllMounted,
  VueWidget,
  WidgetTagProps
} from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { ComponentOptionsMixin, computed, Ref, ref, SetupContext, Slots } from 'vue';
import { useInjectMetaContext, useProviderMetaContext } from '../context';
import { createCustomWidget, CustomWidgetProps, InternalWidget } from '../resolve';
import { BaseWidgetTagMixinContext } from './typing';

/**
 * 函数式组件标签混入可选项
 * 使用此混入方式，必须使用setup调用{@link useWidgetTag}方法
 */
export const UseWidgetTagMixin: ComponentOptionsMixin = {
  props: {
    ...WidgetTagProps
  },
  /**
   * 此方法不会被调用，必须在组件中进行重写
   * @param props
   * @param context
   */
  setup(props, context) {
    return useWidgetTag(props, context);
  },
  render(ctx: BaseWidgetTagMixinContext) {
    return renderWidgets(ctx.widgets as VueWidget[], ctx, ctx.getCurrentSlots());
  }
};

export interface UseWidgetTagContext {
  dslDefinition?: DslDefinition;
  slotName?: string;
  inline?: boolean;
  slotContext?: Record<string, unknown>;
}

export interface UseWidgetTagOptions {
  getWidgetTag?: () => InternalWidget | string;

  getMetadataHandle?: () => string;

  getRootHandle?: () => string;

  getParentHandle?: () => string;

  getDslDefinition?: () => DslDefinition | undefined;

  getSlotName?: () => string;

  getInline?: () => boolean;

  getCustomProps?: () => Record<string, unknown>;

  getProps?: () => CustomWidgetProps;

  getCurrentSlots?: () => Slots | undefined;

  createWidget?: (props: CustomWidgetProps) => RenderWidget | undefined;
}

export interface UseWidgetResult {
  widgetHandle: Ref<string>;

  widget: Ref<VueWidget | undefined>;

  widgets: Ref<VueWidget[]>;

  getWidgetTag: () => InternalWidget | string;

  getMetadataHandle: () => string;

  getRootHandle: () => string;

  getParentHandle: () => string;

  getDslDefinition: () => DslDefinition | undefined;

  getSlotName: () => string;

  getInline: () => boolean;

  getCustomProps: () => Record<string, unknown>;

  getProps: () => CustomWidgetProps;

  getCurrentSlots: () => Slots | undefined;
}

export function useWidgetTag(
  props: UseWidgetTagContext,
  context: SetupContext,
  options?: UseWidgetTagOptions
): UseWidgetResult {
  reportAllMounted();
  const metaContext = useInjectMetaContext();
  const { viewType, metadataHandle, rootHandle, parentHandle, inline } = metaContext;

  const getWidgetTag =
    options?.getWidgetTag ||
    ((): never => {
      throw new Error(`The method 'getWidgetTag' must be overridden.`);
    });

  const getMetadataHandle = options?.getMetadataHandle || (() => metadataHandle.value);

  const getRootHandle = options?.getRootHandle || (() => rootHandle.value);

  const getParentHandle = options?.getParentHandle || (() => parentHandle.value);

  const getDslDefinition = options?.getDslDefinition || (() => props.dslDefinition || (context.attrs as DslDefinition));

  const getSlotName = options?.getSlotName || (() => props.slotName || DEFAULT_SLOT_NAME);

  const getInline =
    options?.getInline ||
    (() => {
      if (isNil(props.inline)) {
        return inline.value;
      }
      return props.inline;
    });

  const getCustomProps = options?.getCustomProps || (() => ({}));

  const getProps =
    options?.getProps ||
    ((): CustomWidgetProps => {
      const inlineProp = getInline();
      return {
        ...context.attrs,
        slotName: getSlotName(),
        inline: inlineProp,
        viewType: viewType.value,
        template: props.dslDefinition,
        slotContext: props.slotContext,
        metadataHandle: getMetadataHandle(),
        rootHandle: getRootHandle(),
        parentHandle: getParentHandle(),
        ...getCustomProps()
      } as CustomWidgetProps;
    });

  const getCurrentSlots =
    options?.getCurrentSlots ||
    (() =>
      DslRender.fetchVNodeSlots(props.dslDefinition) ||
      (Object.keys(context.slots).length ? context.slots : undefined));

  const widgetTag = getWidgetTag();

  const widgetProps = getProps();

  const createWidget =
    options?.createWidget || ((customWidgetProps) => createCustomWidget(widgetTag, customWidgetProps));

  const widgetHandleRef = ref<string>('');
  const widgetRef = ref<VueWidget | undefined>(undefined) as Ref<VueWidget | undefined>;
  const widgetsRef = ref<VueWidget[]>([]) as Ref<VueWidget[]>;
  const renderWidget = createWidget(widgetProps);
  if (!renderWidget) {
    console.error(`Invalid custom widget.`, widgetTag, widgetProps);
    return {
      widgetHandle: widgetHandleRef,
      widget: widgetRef,
      widgets: widgetsRef,
      getWidgetTag,
      getMetadataHandle,
      getRootHandle,
      getParentHandle,
      getDslDefinition,
      getSlotName,
      getInline,
      getCustomProps,
      getProps,
      getCurrentSlots
    };
  }
  const { handle: widgetHandle, widget, widgets } = renderWidget;
  widgetHandleRef.value = widgetHandle;
  widgetRef.value = widget;
  widgetsRef.value = widgets;
  useProviderMetaContext({
    ...metaContext,
    parentHandle: computed(() => widgetHandleRef.value),
    slotName: computed(() => getSlotName()),
    inline: computed(() => getInline())
  });
  return {
    widgetHandle: widgetHandleRef,
    widget: widgetRef,
    widgets: widgetsRef,
    getWidgetTag,
    getMetadataHandle,
    getRootHandle,
    getParentHandle,
    getDslDefinition,
    getSlotName,
    getInline,
    getCustomProps,
    getProps,
    getCurrentSlots
  };
}

import { DEFAULT_SLOT_NAME, DslDefinition } from '@oinone/kunlun-dsl';
import {
  DslRender,
  RenderWidget,
  renderWidgets,
  reportAllMounted,
  VueWidget,
  WidgetTagProps
} from '@oinone/kunlun-vue-widget';
import { ComponentOptionsMixin, computed, ref, Ref, SetupContext, Slots } from 'vue';
import { useInjectMaskContext, useProviderMaskContext } from '../context';
import { createMaskWidget, CreateMaskWidgetProps } from '../resolve';
import { MaskWidgetTagMixinContext } from './typing';

/**
 * 函数式组件标签混入可选项
 * 使用此混入方式，必须使用setup调用{@link useMaskWidgetTag}方法
 */
export const UseMaskWidgetTagMixin: ComponentOptionsMixin = {
  props: {
    ...WidgetTagProps
  },
  /**
   * 此方法不会被调用，必须在组件中进行重写
   * @param props
   * @param context
   */
  setup(props, context) {
    return useMaskWidgetTag(props, context);
  },
  render(ctx: MaskWidgetTagMixinContext) {
    return renderWidgets(ctx.widgets as VueWidget[], ctx, ctx.getCurrentSlots());
  }
};

export interface UseMaskWidgetTagContext {
  dslDefinition?: DslDefinition;
  slotName?: string;
  inline?: boolean;
  slotContext?: Record<string, unknown>;
}

export interface UseMaskWidgetTagOptions {
  getWidgetTag?: () => string;

  getParentHandle?: () => string;

  getDslDefinition?: () => DslDefinition | undefined;

  getSlotName?: () => string;

  getCustomProps?: () => Record<string, unknown>;

  getProps?: () => CreateMaskWidgetProps;

  getCurrentSlots?: () => Slots | undefined;

  createWidget?: (props: CreateMaskWidgetProps) => RenderWidget | undefined;
}

export interface UseMaskWidgetResult {
  widgetHandle: Ref<string>;

  widget: Ref<VueWidget | undefined>;

  widgets: Ref<VueWidget[]>;

  getWidgetTag: () => string;

  getParentHandle: () => string;

  getDslDefinition: () => DslDefinition | undefined;

  getSlotName: () => string;

  getCustomProps: () => Record<string, unknown>;

  getProps: () => CreateMaskWidgetProps;

  getCurrentSlots: () => Slots | undefined;
}

export function useMaskWidgetTag(
  props: UseMaskWidgetTagContext,
  context: SetupContext,
  options?: UseMaskWidgetTagOptions
): UseMaskWidgetResult {
  reportAllMounted();
  const maskContext = useInjectMaskContext();
  const { parentHandle } = maskContext;

  const getWidgetTag =
    options?.getWidgetTag ||
    ((): never => {
      throw new Error(`The method 'getWidgetTag' must be overridden.`);
    });

  const getParentHandle = options?.getParentHandle || (() => parentHandle.value);

  const getDslDefinition = options?.getDslDefinition || (() => props.dslDefinition || (context.attrs as DslDefinition));

  const getSlotName = options?.getSlotName || (() => props.slotName || DEFAULT_SLOT_NAME);

  const getCustomProps = options?.getCustomProps || (() => ({}));

  const getProps =
    options?.getProps ||
    ((): CreateMaskWidgetProps => {
      return {
        ...context.attrs,
        slotName: getSlotName(),
        template: props.dslDefinition,
        slotContext: props.slotContext,
        parentHandle: getParentHandle(),
        ...getCustomProps()
      } as CreateMaskWidgetProps;
    });

  const getCurrentSlots =
    options?.getCurrentSlots ||
    (() =>
      DslRender.fetchVNodeSlots(props.dslDefinition) ||
      (Object.keys(context.slots).length ? context.slots : undefined));

  const widgetTag = getWidgetTag();

  const widgetProps = getProps();

  const createWidget = options?.createWidget || ((customWidgetProps) => createMaskWidget(widgetTag, customWidgetProps));

  const widgetHandleRef = ref<string>('');
  const widgetRef = ref<VueWidget | undefined>(undefined) as Ref<VueWidget | undefined>;
  const widgetsRef = ref<VueWidget[]>([]) as Ref<VueWidget[]>;
  const renderWidget = createWidget(widgetProps);

  if (!renderWidget) {
    console.error(`Invalid mask widget.`, widgetTag, widgetProps);
    return {
      widgetHandle: widgetHandleRef,
      widget: widgetRef,
      widgets: widgetsRef,
      getWidgetTag,
      getParentHandle,
      getDslDefinition,
      getSlotName,
      getCustomProps,
      getProps,
      getCurrentSlots
    };
  }
  const { handle: widgetHandle, widget, widgets } = renderWidget;
  widgetHandleRef.value = widgetHandle;
  widgetRef.value = widget;
  widgetsRef.value = widgets;
  useProviderMaskContext({
    ...maskContext,
    parentHandle: computed(() => widgetHandleRef.value),
    slotName: computed(() => getSlotName())
  });
  return {
    widgetHandle: widgetHandleRef,
    widget: widgetRef,
    widgets: widgetsRef,
    getWidgetTag,
    getParentHandle,
    getDslDefinition,
    getSlotName,
    getCustomProps,
    getProps,
    getCurrentSlots
  };
}

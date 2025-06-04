<script lang="ts">
import { ViewType } from '@oinone/kunlun-meta';
import { Optional } from '@oinone/kunlun-shared';
import { DslRender, renderWidgets, reportAllMounted, VueWidget, WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { computed, defineComponent, PropType, ref, Slots } from 'vue';
import { createOrUpdateRuntimeContextByDslDefinition, useInjectMetaContext, useProviderMetaContext } from './context';
import { createCustomWidget, InternalWidget } from './resolve';
import { ViewWidgetProps } from './resolve/internal';

export default defineComponent({
  name: 'View',
  inheritAttrs: false,
  props: {
    ...WidgetTagProps,
    metadataHandle: {
      type: String
    },
    rootHandle: {
      type: String
    },
    parentHandle: {
      type: String
    },
    type: {
      type: String as PropType<ViewType>
    }
  },
  setup(props, context) {
    reportAllMounted();

    const metaContext = useInjectMetaContext();
    const { viewType, metadataHandle, rootHandle, parentHandle, inline } = metaContext;
    const handleRef = ref<string>('');
    const widgetsRef = ref<VueWidget[]>([]);
    const currentSlots = computed<Slots | undefined>(
      () =>
        DslRender.fetchVNodeSlots(props.dslDefinition) ||
        (Object.keys(context.slots).length ? context.slots : undefined)
    );
    const getInline = () => Optional.ofNullable(props.inline).orElse(inline.value)!;
    const inlineProp = getInline();
    const renderWidget = createCustomWidget(InternalWidget.View, {
      ...context.attrs,
      type: props.type || viewType.value,
      template: props.dslDefinition,
      metadataHandle: props.metadataHandle || metadataHandle.value,
      rootHandle: props.rootHandle || rootHandle.value,
      parentHandle: props.parentHandle || parentHandle.value,
      slotName: props.slotName,
      inline: inlineProp
    } as ViewWidgetProps);
    if (!renderWidget) {
      console.error(`Invalid custom widget.`);
      return {
        handle: handleRef,
        widgets: widgetsRef,
        currentSlots,
        inline
      };
    }
    const { handle, widgets } = renderWidget;
    handleRef.value = handle;
    widgetsRef.value = widgets;

    if (handle && props.dslDefinition) {
      createOrUpdateRuntimeContextByDslDefinition(props.dslDefinition, handle);
    }

    useProviderMetaContext({
      ...metaContext,
      viewType: computed(() => {
        return props.dslDefinition?.type || metaContext.viewType.value;
      }),
      model: computed(() => {
        return props.dslDefinition?.model || metaContext.model.value;
      }),
      modelName: computed(() => {
        return props.dslDefinition?.modelName || metaContext.modelName.value;
      }),
      moduleName: computed(() => {
        return props.dslDefinition?.moduleName || metaContext.moduleName.value;
      }),
      rootHandle: computed(() => handleRef.value),
      parentHandle: computed(() => handleRef.value),
      slotName: computed(() => props.slotName),
      inline: computed(() => getInline())
    });

    return {
      handle: handleRef,
      widgets: widgetsRef,
      currentSlots,
      inline: computed(() => getInline())
    };
  },
  render(ctx) {
    return renderWidgets(this.widgets as VueWidget[], ctx, this.currentSlots);
  }
});
</script>

<script lang="ts">
import { DslDefinitionType } from '@oinone/kunlun-dsl';
import { ActiveRecords, RuntimeContextManager, RuntimeModelField } from '@oinone/kunlun-engine';
import { RenderWidget, VueWidget, WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent, PropType, Slots } from 'vue';
import { BaseFieldOptions, BaseFieldWidget, EditorFieldWidget } from '../../basic';
import { selectorEditorFieldMixinComponent } from '../../spi';
import { useInjectMetaContext } from '../context';
import { useWidgetTag, UseWidgetTagMixin } from '../mixin';
import { CustomWidgetProps, InternalWidget } from '../resolve';
import { createFlexContainerItem, FieldWidgetProps } from '../resolve/internal';
import { ViewType } from '@oinone/kunlun-meta';

function createEditorFieldWidget(props: FieldWidgetProps): RenderWidget | undefined {
  const { rootHandle, parentHandle, widget, model, data, __metadata_index } = props;
  const rootContext = RuntimeContextManager.get(rootHandle);
  if (!rootContext) {
    console.error('context not initialized.', rootHandle);
    return undefined;
  }
  const { view, model: runtimeModel } = rootContext;
  let modelField: RuntimeModelField | undefined;
  if (model && data) {
    modelField = runtimeModel.modelFields.find((f) => f.data === data && f.__index === __metadata_index);
  }
  const isField = props.template?.dslNodeType === DslDefinitionType.FIELD;
  if (isField && !modelField) {
    console.warn('runtime field not found.', runtimeModel, props);
    return undefined;
  }
  const { type: viewType, name: viewName } = view;
  let widgetRef: BaseFieldWidget | undefined;
  const widgets: VueWidget[] = [];
  const { name, multi, ttype } = modelField || ({} as RuntimeModelField);
  const options: BaseFieldOptions = {
    viewType,
    widget,
    ttype,
    multi,
    model: props.model || runtimeModel?.model,
    viewName,
    name
  };
  const constructor =
    EditorFieldWidget.Selector(options) ||
    BaseFieldWidget.Selector({
      ...options,
      viewType: ViewType.Form
    });
  if (!constructor) {
    console.error('Invalid editor field widget', options);
    return undefined;
  }
  const widgetInstance = createFlexContainerItem(widgets, parentHandle, props, (parentWidget, realParentHandle) => {
    return (widgetRef = parentWidget.createWidget(constructor, realParentHandle, {
      ...props,
      viewType,
      field: modelField
    }));
  });
  if (widgetRef!.getMixinComponent() == null) {
    const mixinComponent = selectorEditorFieldMixinComponent({ viewType });
    if (mixinComponent) {
      widgetRef!.setMixinComponent(mixinComponent);
    }
  }
  return {
    handle: widgetInstance.getHandle(),
    widget: widgetRef!,
    widgets
  };
}

export default defineComponent({
  name: 'EditorField',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps,
    parentHandle: {
      type: String
    },
    dataSource: {
      type: Object as PropType<ActiveRecords>
    },
    activeRecords: {
      type: Object as PropType<ActiveRecords>
    },
    rowIndex: {
      type: Number
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { parentHandle, viewType } = useInjectMetaContext();
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.Field;
      },
      getParentHandle(): string {
        return props.parentHandle || parentHandle.value;
      },
      getCustomProps(): Record<string, unknown> {
        return {
          viewType: viewType.value,
          activeRecords: props.activeRecords,
          rowIndex: props.rowIndex
        };
      },
      getCurrentSlots(): Slots | undefined {
        return undefined;
      },
      createWidget(widgetProps: CustomWidgetProps): RenderWidget | undefined {
        if (widgetProps.automatic == null) {
          widgetProps.automatic = true;
        }
        return createEditorFieldWidget(widgetProps as FieldWidgetProps);
      }
    });
  }
});
</script>

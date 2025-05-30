<script lang="ts">
import { DslDefinition } from '@kunlun/dsl';
import { isRelationField, RuntimeContextManager } from '@kunlun/engine';
import { isRelatedTtype } from '@kunlun/meta';
import { BooleanHelper, CastHelper } from '@kunlun/shared';
import { DslRender, WidgetTagProps } from '@kunlun/vue-widget';
import { cloneDeep } from 'lodash-es';
import { defineComponent, Slots } from 'vue';
import { useInjectMetaContext } from './context';
import { useWidgetTag, UseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

function autoFillFields(dslDefinition: DslDefinition | undefined): DslDefinition | undefined {
  if (!dslDefinition) {
    return undefined;
  }
  if (BooleanHelper.isTrue(dslDefinition.autoFill)) {
    const runtimeContext = RuntimeContextManager.get(useInjectMetaContext().rootHandle.value);
    if (runtimeContext && !runtimeContext.model.modelFields.length) {
      const parentRuntimeContext = runtimeContext.parentContext;
      runtimeContext.model.modelFields = parentRuntimeContext?.model.modelFields || [];
      let fields = cloneDeep(parentRuntimeContext?.model.modelFields || []);
      fields = fields.filter((field) => {
        if (isRelatedTtype(field.ttype)) {
          return false;
        }
        if (isRelationField(field)) {
          return field.relationStore && field.referenceFields.length;
        }
        return field.store;
      });
      fields.forEach((_f) => (_f.readonly = false));
      dslDefinition.widgets = CastHelper.cast(fields);
    }
  }
  return dslDefinition;
}

export default defineComponent({
  name: 'Search',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps
  },
  setup(props, context) {
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.Search;
      },
      getCurrentSlots(): Slots | undefined {
        return (
          DslRender.fetchVNodeSlots(autoFillFields(props.dslDefinition)) ||
          (Object.keys(context.slots).length ? context.slots : undefined)
        );
      }
    });
  }
});
</script>

<script lang="ts">
import type { ActiveRecords } from '@oinone/kunlun-engine';
import { useInjectMetaContext, WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent, type PropType } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

export default defineComponent({
  name: 'ActionBar',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps,
    parentHandle: {
      type: String
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
        return InternalWidget.ActionBar;
      },
      getParentHandle(): string {
        return props.parentHandle || parentHandle.value;
      },
      getCustomProps(): Record<string, unknown> {
        return {
          viewType,
          activeRecords: props.activeRecords,
          rowIndex: props.rowIndex
        };
      }
    });
  }
});
</script>

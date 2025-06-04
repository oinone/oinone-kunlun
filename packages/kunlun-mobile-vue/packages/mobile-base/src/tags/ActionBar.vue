<script lang="ts">
import { ActiveRecords } from '@oinone/kunlun-engine';
import { WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent, PropType } from 'vue';
import { useInjectMetaContext } from './context';
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

<script lang="ts">
import { ActiveRecords } from '@kunlun/engine';
import { WidgetTagProps } from '@kunlun/vue-widget';
import { defineComponent, PropType, watch, watchEffect } from 'vue';
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
    },
    refreshWidgetRecord: {
      type: Function
    }
  },

  mounted() {
    watch(
      () => this.activeRecords,
      () => {
        this.refreshWidgetRecord && this.refreshWidgetRecord(this.widget);
      }
    );
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

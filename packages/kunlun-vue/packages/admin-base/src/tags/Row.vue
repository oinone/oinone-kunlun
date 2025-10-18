<script lang="ts">
import { useInjectMetaContext, WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

export default defineComponent({
  name: 'Row',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps,
    parentHandle: {
      type: String
    }
  },
  setup(props, context) {
    const { parentHandle } = useInjectMetaContext();
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.Row;
      },
      getParentHandle(): string {
        return props.parentHandle || parentHandle.value;
      }
    });
  }
});
</script>

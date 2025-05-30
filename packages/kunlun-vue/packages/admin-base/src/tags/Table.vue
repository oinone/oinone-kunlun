<script lang="ts">
import { WidgetTagProps } from '@kunlun/vue-widget';
import { defineComponent } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

export default defineComponent({
  name: 'Table',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps
  },
  setup(props, context) {
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.Table;
      }
    });
  }
});
</script>

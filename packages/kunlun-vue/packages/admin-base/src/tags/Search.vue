<script lang="ts">
import { WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

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
      }
    });
  }
});
</script>

<script lang="ts">
import { WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent } from 'vue';
import { UseWidgetTagMixin } from '../mixin';
import { useTabsWidgetTag } from './useTabsWidgetTag';

export default defineComponent({
  name: 'Tabs',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps
  },
  setup(props, context) {
    return useTabsWidgetTag(props, context);
  }
});
</script>

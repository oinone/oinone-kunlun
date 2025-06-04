<script lang="ts">
import { WidgetTagProps } from '@oinone/kunlun-vue-widget';
import { defineComponent } from 'vue';
import { UseWidgetTagMixin } from '../../mixin';
import { usePackCombinationWidgetTag } from './usePackCombinationWidgetTag';

export default defineComponent({
  name: 'PackCombination',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  props: {
    ...WidgetTagProps
  },
  setup(props, context) {
    return usePackCombinationWidgetTag(props, context);
  }
});
</script>

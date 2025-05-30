<script lang="ts">
import { defineComponent, Slots } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from '../mixin';
import { InternalWidget } from '../resolve';

export default defineComponent({
  name: 'TimeRangePicker',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  setup(props, context) {
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.TimeRangePicker;
      },
      getCurrentSlots(): Slots | undefined {
        return undefined;
      }
    });
  }
});
</script>

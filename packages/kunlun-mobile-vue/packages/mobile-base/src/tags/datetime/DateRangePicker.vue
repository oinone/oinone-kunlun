<script lang="ts">
import { defineComponent, Slots } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from '../mixin';
import { InternalWidget } from '../resolve';

export default defineComponent({
  name: 'DateRangePicker',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  setup(props, context) {
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.DateRangePicker;
      },
      getCurrentSlots(): Slots | undefined {
        return undefined;
      }
    });
  }
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

export default defineComponent({
  name: 'Element',
  mixins: [UseWidgetTagMixin],
  inheritAttrs: false,
  setup(props, context) {
    return useWidgetTag(props, context, {
      getWidgetTag(): InternalWidget {
        return InternalWidget.Element;
      }
    });
  }
});
</script>

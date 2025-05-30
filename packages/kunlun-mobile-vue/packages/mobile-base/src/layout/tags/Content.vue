<script lang="ts">
import { defineComponent } from 'vue';
import { MaskWidgetTagMixin } from './mixin';
import { InternalMaskWidget } from './resolve';

export default defineComponent({
  name: 'Content',
  mixins: [MaskWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag(): InternalMaskWidget {
      return InternalMaskWidget.Content;
    }
  }
});
</script>

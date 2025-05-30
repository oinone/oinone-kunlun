<script lang="ts">
import { defineComponent } from 'vue';
import { MaskWidgetTagMixin } from './mixin';
import { InternalMaskWidget } from './resolve';

export default defineComponent({
  name: 'Block',
  mixins: [MaskWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag(): InternalMaskWidget {
      return InternalMaskWidget.Block;
    }
  }
});
</script>

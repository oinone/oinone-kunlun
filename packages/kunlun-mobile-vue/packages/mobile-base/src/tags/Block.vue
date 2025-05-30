<script lang="ts">
import { defineComponent } from 'vue';
import { InternalWidget } from './resolve';
import { BaseWidgetTagMixin } from './mixin';

export default defineComponent({
  name: 'Block',
  mixins: [BaseWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag() {
      return InternalWidget.Block;
    }
  }
});
</script>

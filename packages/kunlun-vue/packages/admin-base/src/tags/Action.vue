<script lang="ts">
import { defineComponent, Slots } from 'vue';
import { InternalWidget } from './resolve';
import { BaseWidgetTagMixin } from './mixin';

export default defineComponent({
  name: 'Action',
  mixins: [BaseWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag() {
      return InternalWidget.Action;
    },
    getCurrentSlots(): Slots | undefined {
      return undefined;
    }
  }
});
</script>

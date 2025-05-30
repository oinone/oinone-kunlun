<script lang="ts">
import { defineComponent, Slots } from 'vue';
import { InternalWidget } from './resolve';
import { BaseWidgetTagMixin } from './mixin';

export default defineComponent({
  name: 'Field',
  mixins: [BaseWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag(): InternalWidget {
      return InternalWidget.Field;
    },
    getCurrentSlots(): Slots | undefined {
      return undefined;
    }
  }
});
</script>

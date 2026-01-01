<script lang="ts">
import { defineComponent, type Slots } from 'vue';
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

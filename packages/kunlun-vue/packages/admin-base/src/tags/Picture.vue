<script lang="ts">
import { defineComponent } from 'vue';
import { InternalWidget } from './resolve';
import { BaseWidgetTagMixin } from './mixin';

export default defineComponent({
  name: 'Picture',
  mixins: [BaseWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag(): InternalWidget {
      return InternalWidget.Picture;
    }
  }
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import { BaseWidgetTagMixin } from './mixin';
import { InternalWidget } from './resolve';

export default defineComponent({
  name: 'Custom',
  mixins: [BaseWidgetTagMixin],
  inheritAttrs: false,
  methods: {
    getWidgetTag(): InternalWidget {
      return InternalWidget.Custom;
    }
  }
});
</script>

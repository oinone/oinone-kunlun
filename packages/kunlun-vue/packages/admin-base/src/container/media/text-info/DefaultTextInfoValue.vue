<script lang="ts">
import { createVNode, defineComponent, type PropType } from 'vue';
import { Field } from '../../../tags';

export default defineComponent({
  name: 'DefaultTextInfoValue',
  props: {
    fieldWidget: {
      type: Object as PropType<Record<string, any>>
    },
    invisible: {
      type: Boolean
    }
  },
  render() {
    if (this.invisible) {
      return undefined;
    }
    const fieldProperties = this.fieldWidget;
    const fieldVNode = createVNode(Field, { ...fieldProperties, label: false });
    return createVNode('div', { class: 'default-value' }, [fieldVNode]);
  }
});
</script>
<style lang="scss">
.default-value {
  padding: var(--oio-padding-xs);
  width: 100%;
}
</style>

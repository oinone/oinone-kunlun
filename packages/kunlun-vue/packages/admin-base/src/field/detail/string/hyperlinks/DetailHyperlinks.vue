<script lang="ts">
import { OioEmpty } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';

export default defineComponent({
  name: 'DetailHyperlinks',
  inheritAttrs: false,
  props: {
    text: {
      type: String
    },
    value: {
      type: String
    },
    target: {
      type: String
    },
    emptyStyle: {
      type: String
    }
  },
  render() {
    return createVNode('div', { class: 'form-string-hyperlinks', title: this.value }, [
      !this.text && !this.value
        ? createVNode(OioEmpty, { emptyStyle: this.emptyStyle })
        : createVNode('a', { href: this.value, target: this.target }, this.text || this.value)
    ]);
  }
});
</script>

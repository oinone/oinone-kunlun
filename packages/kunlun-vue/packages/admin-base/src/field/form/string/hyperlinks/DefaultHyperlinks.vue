<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import { InputMediaMode } from '@kunlun/vue-ui-common';
import { useMetadataProps } from '../../../../basic';
import { InputMediaProps } from '../../../prop';
import DefaultString from '../DefaultString.vue';

export default defineComponent({
  name: 'DefaultHyperlinks',
  inheritAttrs: false,
  props: {
    ...InputMediaProps,
    text: {
      type: String
    },
    target: {
      type: String
    }
  },
  setup(props) {
    const { realValue } = useMetadataProps(props, false);

    return {
      realValue
    };
  },
  render() {
    const _linkProps: Record<string, unknown> = {
      ...this.$props,
      'onUpdate:value': this.change,
      onFocus: this.focus,
      onBlur: this.blur
    };
    if (this.mode === InputMediaMode.DYNAMIC) {
      return createVNode(DefaultString, _linkProps);
    }
    return createVNode('div', { class: 'form-string-hyperlinks', title: this.realValue }, [
      !this.text && !this.realValue
        ? createVNode('span', { class: 'oio-empty' }, '-')
        : createVNode('a', { href: this.realValue, target: this.target }, this.text || this.realValue)
    ]);
  }
});
</script>

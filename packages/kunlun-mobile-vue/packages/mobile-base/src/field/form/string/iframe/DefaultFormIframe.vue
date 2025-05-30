<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import { InputMediaMode } from '@kunlun/vue-ui-common';
import { DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';
import { translateValueByKey } from '@kunlun/engine';
import { InputMediaProps } from '../../../prop';
import DefaultString from '../DefaultString.vue';

export default defineComponent({
  props: {
    ...InputMediaProps
  },
  inheritAttrs: false,
  render() {
    const _props: Record<string, unknown> = {
      ...this.$props,
      'onUpdate:value': this.change,
      onFocus: this.focus,
      onBlur: this.blur
    };
    if (this.mode === InputMediaMode.DYNAMIC) {
      return createVNode(DefaultString, _props);
    }
    const designNode = createVNode('div', { class: 'mobile-form-iframe-area-design' }, translateValueByKey('示例iframe网页'));
    const designEmptyNode = createVNode('span', { class: `${DEFAULT_PREFIX}-empty` }, '-');
    const runNode = createVNode('iframe', {
      class: 'mobile-form-iframe-area',
      frameborder: '0',
      src: this.value
    });
    let realNode;
    if (this.defaultValue && !this.value) {
      realNode = designNode;
    } else if (!this.defaultValue && !this.value) {
      realNode = designEmptyNode;
    } else {
      realNode = runNode;
    }
    return createVNode('div', { class: 'mobile-form-iframe' }, [realNode]);
  }
});
</script>
<style lang="scss">
.mobile-form-iframe {
  height: 100%;
  .mobile-form-iframe-area-design {
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border: 1px var(--oio-border-color) solid;
    background-color: #ffffff;
  }

  .mobile-form-iframe-area {
    height: 350px;
    width: 100%;
  }
}
</style>

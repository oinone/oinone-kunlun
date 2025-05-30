<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import { InputMediaMode } from '@kunlun/vue-ui-common';
import { DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';
import { useMetadataProps } from '../../../../basic';
import { InputMediaProps } from '../../../prop';
import DefaultString from '../DefaultString.vue';
import { autoNoticeOuterUrl } from '../../../../util';

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
    return createVNode('div',
      {
        class: `${DEFAULT_PREFIX}-form-string-hyperlinks`,
        title: this.realValue
      },
      [
      !this.text && !this.realValue
        ? createVNode('span', { class: `${DEFAULT_PREFIX}-empty` }, '-')
        : createVNode('a', {
          href: this.realValue,
          target: this.target,
          onClick: (e) => {
            if (!autoNoticeOuterUrl(this.realValue, false)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }, this.text || this.realValue)
    ]);
  }
});
</script>

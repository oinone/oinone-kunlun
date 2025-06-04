<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { InputType, OioInputProps } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioCustomInput',
  inheritAttrs: false,
  props: {
    ...OioInputProps,
    textarea: Boolean
  },
  setup(props, context) {
    const inputRef = ref(null as any);
    context.expose({
      focus: () => inputRef.value.focus?.(),
      blur: () => inputRef.value.blur?.()
    });
    return { inputRef };
  },
  render() {
    const mainClassName = `${DEFAULT_PREFIX}-custom-input`;
    const classList = [mainClassName];
    const childrenNode = [] as any[];
    if (this.textarea) {
      classList.push(`${mainClassName}-textarea`);
    }
    if (this.readonly) {
      classList.push(`${mainClassName}-readonly`);
      childrenNode.push(
        this.value || !this.placeholder
          ? this.value
          : createVNode('span', { class: `${mainClassName}-placeholder` }, this.placeholder)
      );
    }

    const props = {
      ...this.$props,
      ...this.$attrs,
      ref: 'inputRef',
      class: StringHelper.append(classList, CastHelper.cast(this.$attrs.class))
    };
    if (!this.readonly && this.type === InputType.PASSWORD.toLowerCase()) {
      props.autocomplete = 'new-password';
    }
    return createVNode(this.readonly ? 'span' : 'input', props, childrenNode);
  }
});
</script>

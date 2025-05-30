<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { ATextareaProps, OioTextareaProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { isEmpty, isNil } from 'lodash-es';
import { createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import OioCustomInput from '../oio-input/oio-custome-input.vue';

export default defineComponent({
  name: 'OioTextarea',
  components: {
  },
  inheritAttrs: false,
  props: {
    ...OioTextareaProps
  },
  emits: ['update:value', 'change'],
  setup(props, context) {
    const origin = ref();

    context.expose({
      focus: () => origin.value.focus(),
      blur: () => origin.value.blur()
    });

    return {
      origin
    };
  },
  render() {
    const otherProps = {};
    const textareaClassList = [`${DEFAULT_PREFIX}-textarea`];
    if (this.readonly) {
      textareaClassList.push(`${DEFAULT_PREFIX}-textarea-readonly`);
    }
    if (this.allowClear && !isEmpty(this.value)) {
      textareaClassList.push(`${DEFAULT_PREFIX}-textarea-allow-clear`);
    }
    const maxlength = this.maxlength;
    const { truncateMaxLength } = this;
    const textareaProps: Record<string, unknown> = {
      ...PropRecordHelper.convert(ATextareaProps, CastHelper.cast(this)),
      ...this.$attrs,
      readonly: this.readonly,
      'onInput': (event) => this.$emit('update:value', event && event.target && event.target.value ),
      ref: 'origin'
    };
    if (this.showCount && (!isNil(maxlength) || !isNil(truncateMaxLength))) {
      let { value } = this;
      if (isNil(value)) {
        value = '';
      }
      textareaClassList.push(`${DEFAULT_PREFIX}-textarea-show-count`);
      otherProps['data-count'] = value.length;
      otherProps['data-total'] = maxlength || truncateMaxLength;
      textareaProps.class = StringHelper.append([], CastHelper.cast(this.$attrs.class));
    } else {
      textareaProps.class = StringHelper.append(textareaClassList, CastHelper.cast(this.$attrs.class));
    }

    let textareaNode = this.readonly ? createVNode(OioCustomInput, { ...textareaProps, textarea: true }) : createVNode('textarea', textareaProps);
    if (!isEmpty(otherProps)) {
      textareaNode = createVNode(
        'div',
        {
          class: textareaClassList,
          style: this.$attrs.style,
          ...otherProps
        },
        [textareaNode]
      );
    }
    return textareaNode;
  }
});
</script>

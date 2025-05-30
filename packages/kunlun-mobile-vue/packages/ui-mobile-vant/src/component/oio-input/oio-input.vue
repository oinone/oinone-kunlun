<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  AInputProps,
  IInputmodeEnum,
  OioInputProps,
  PropRecordHelper
} from '@kunlun/vue-ui-common';
import { isEmpty, isNil } from 'lodash-es';
import { createVNode, defineComponent, PropType, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import OioInputGroup from './oio-input-group.vue';

export default defineComponent({
  name: 'OioInput',
  components: {
  },
  inheritAttrs: false,
  props: {
    ...OioInputProps,
    inputmode: {
      type: String as PropType<IInputmodeEnum>
    }
  },
  slots: ['prepend', 'append', 'prefix', 'suffix'],
  emits: ['update:value', 'change', 'blur', 'focus'],
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
    const inputClassList = [`${DEFAULT_PREFIX}-input`, 'x-van-field__control'];
    if (this.readonly) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-readonly`);
    }
    const allowClear = this.allowClear && !isEmpty(this.value);
    if (allowClear) {
      // inputClassList.push(`${DEFAULT_PREFIX}-input-allow-clear`);
    }
    let component = createVNode(
      OioInputGroup,
      // 'input',
      {
        ...PropRecordHelper.convert(AInputProps, CastHelper.cast(this)),
        readonly: this.readonly,
        inputmode: this.inputmode,
        ...this.$attrs,
        onChange: (val) => {
          this.$emit('update:value', val);
          this.$emit('change', val);
        },
        onFocus: (val) => {
          this.$emit('focus', val);
        },
        onBlur: (val) => {
          this.$emit('blur', val);
        },
        class: StringHelper.append(inputClassList, CastHelper.cast(this.$attrs.class)),
        ref: 'origin'
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        ['prepend', 'addonBefore'],
        ['append', 'addonAfter'],
        'prefix',
        'suffix'
      ])
    );
    const maxlength = this.maxlength;
    if (this.showCount && !isNil(maxlength)) {
      const wrapperClassList = [`${DEFAULT_PREFIX}-input-wrapper`, `${DEFAULT_PREFIX}-input-show-count`];
      if (allowClear) {
        wrapperClassList.push(`${DEFAULT_PREFIX}-input-allow-clear`);
      }
      let { value } = this;
      if (isNil(value)) {
        value = '';
      }
      component.props = { ...component.props, style: {}};
      component = createVNode(
        'div',
        {
          class: wrapperClassList,
          style: this.$attrs.style,
          'data-count': value.length,
          'data-total': maxlength
        },
        [component]
      );
    }
    return component;
  }
});
</script>

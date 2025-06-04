<script lang="ts">
import { BooleanHelper, CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { AInputProps, InputFocusOptions, OioInputProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Input as AInput } from 'ant-design-vue';
import { isBoolean, isEmpty, isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, onMounted, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioInput',
  components: {
    AInput
  },
  inheritAttrs: false,
  props: {
    ...OioInputProps
  },
  slots: ['prepend', 'append', 'prefix', 'suffix'],
  emits: ['update:value', 'press-enter'],
  setup(props, context) {
    const origin = ref();

    const internalValue = ref<string | undefined>();
    const value = computed<string | undefined>({
      get() {
        return props.value || internalValue.value;
      },
      set(value) {
        context.emit('update:value', value);
        internalValue.value = value;
      }
    });

    const autocomplete = computed<string | undefined>(() => {
      if (props.autocomplete == null) {
        return 'new-password';
      }
      const val = BooleanHelper.toBoolean(props.autocomplete);
      if (isBoolean(val)) {
        return val ? 'on' : 'off';
      }
      return props.autocomplete as string | undefined;
    });

    const onUpdateValue = (val: string | undefined) => {
      value.value = val;
    };

    const onPressEnter = (event: KeyboardEvent) => {
      context.emit('press-enter', event);
    };

    context.expose({
      focus: (options?: InputFocusOptions) => origin.value.focus(options),
      blur: () => origin.value.blur()
    });

    onMounted(() => {
      if (props.autofocus) {
        origin.value.focus();
      }
    });

    return {
      origin,
      value,
      autocomplete,

      onUpdateValue,
      onPressEnter
    };
  },
  render() {
    const inputClassList = [`${DEFAULT_PREFIX}-input`];
    if (this.readonly) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-readonly`);
    }
    const allowClear = this.allowClear && !isEmpty(this.value);
    if (allowClear) {
      inputClassList.push(`${DEFAULT_PREFIX}-input-allow-clear`);
    }
    let component = createVNode(
      AInput,
      {
        ...PropRecordHelper.convert(AInputProps, CastHelper.cast(this)),
        autocomplete: this.autocomplete,
        readonly: this.readonly,
        ...this.$attrs,
        'onUpdate:value': this.onUpdateValue,
        onPressEnter: this.onPressEnter,
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
    const maxlenght = this.maxlength;
    if (this.showCount && !isNil(maxlenght)) {
      const wrapperClassList = [`${DEFAULT_PREFIX}-input-wrapper`, `${DEFAULT_PREFIX}-input-show-count`];
      if (allowClear) {
        wrapperClassList.push(`${DEFAULT_PREFIX}-input-allow-clear`);
      }
      let { value } = this;
      if (isNil(value)) {
        value = '';
      }
      component = createVNode(
        'div',
        {
          class: wrapperClassList,
          'data-count': value.length,
          'data-total': maxlenght
        },
        [component]
      );
    }
    return component;
  }
});
</script>

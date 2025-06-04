<template>
  <div :class="classList" :style="style">
    <div :class="`${DEFAULT_PREFIX}-input-group-addon-before`" v-if="$slots.addonBefore">
      <slot name="addonBefore" />
    </div>
    <div :class="`${DEFAULT_PREFIX}-input-group-prefix`" v-if="$slots.prefix">
      <slot name="prefix" />
    </div>
    <oio-custom-input
      ref="origin"
      v-bind="inputProps"
      class="van-field__control"
      :value="value"
      :inputmode="inputmode"
      @blur="(e) => $emit('blur', e)"
      @focus="(e) => $emit('focus', e)"
      @input="changeHandle"
    />
    <div :class="`${DEFAULT_PREFIX}-input-group-suffix`" v-if="$slots.suffix">
      <slot name="suffix" />
    </div>
    <div :class="`${DEFAULT_PREFIX}-input-group-addon-after`" v-if="$slots.addonAfter">
      <slot name="addonAfter" />
    </div>
    <!--    <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear" v-if="1>0||allowClear" @click="clearHandle" />-->
  </div>
</template>
<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { IInputmodeEnum, OioInputProps } from '@oinone/kunlun-vue-ui-common';
import { isEmpty } from 'lodash-es';
import { computed, defineComponent, PropType, ref } from 'vue';
import OioCustomInput from './oio-custome-input.vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioInputGroup',
  components: {
    OioCustomInput
  },
  inheritAttrs: false,
  props: {
    ...OioInputProps,
    style: Object as PropType<CSSStyleDeclaration>,
    inputmode: {
      type: String as PropType<IInputmodeEnum>,
      default: IInputmodeEnum.TEXT,
      required: false
    }
  },
  slots: ['addonBefore', 'addonAfter', 'prefix', 'suffix'],
  emits: ['update:value', 'change', 'blur', 'focus'],
  setup(props, context) {
    const origin = ref();

    context.expose({
      focus: () => origin.value.focus?.(),
      blur: () => origin.value.blur?.()
    });

    const classList = computed(() => {
      return StringHelper.append([`${DEFAULT_PREFIX}-input-group`], CastHelper.cast(context.attrs.class));
    });

    function changeHandle(event) {
      // this.$emit('update:value', event && event.target && event.target.value);
      context.emit('change', event && event.target && event.target.value);
    }

    function clearHandle() {
      context.emit('change', '');
    }

    const allowClear = computed(() => props.allowClear && !isEmpty(props.value));

    const inputProps = computed(() => ({ ...props, style: {} }));
    return {
      inputProps,
      classList,
      origin,
      allowClear,
      changeHandle,
      clearHandle,
      DEFAULT_PREFIX
    };
  }
});
</script>

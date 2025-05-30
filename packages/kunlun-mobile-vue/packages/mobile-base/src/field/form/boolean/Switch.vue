<template>
  <div class="mobile-form-bool-switch">
    <oio-switch
      v-if="!readonly || (readonly && disabled)"
      :checked="booleanValue"
      :disabled="disabled"
      @change="changeHandler"
    />
    <div v-else-if="readonly && booleanValue !== undefined">
      {{ booleanValue ? boolTranslate('kunlun.fields.boolean.true') : boolTranslate('kunlun.fields.boolean.false') }}
    </div>
    <div class="empty-value" v-else-if="readonly && booleanValue === undefined">-</div>
  </div>
</template>
<script lang="ts">
import { BooleanHelper, OioSwitch } from '@kunlun/vue-ui-mobile-vant';
import { computed, defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../basic';

export default defineComponent({
  components: {
    OioSwitch
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: Boolean,
      default: undefined
    },
    defaultValue: {
      type: Boolean
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props);
    if (realValue.value === undefined) {
      realValue.value = false;
    }

    const booleanValue = computed(() => BooleanHelper.toBoolean(realValue.value));

    const boolTranslate = (key, values: { [key: string]: any } = {}) => {
      const translate = Reflect.get(window, 'translate');

      const result = translate ? translate(key) : '';

      if (result === key || Object.keys(values).length === 0) {
        return result;
      }

      const regExp = /\{\s*([A-Z0-9_]+)\s*\}/gi;

      return result.replace(regExp, (matched: string, k: string): string => values[k]);
    };

    const changeHandler = (event) => {
      if (props.change) {
        props.change(event);
      }
      /**
       * 触发失焦校验
       */
      if (props.blur) {
        props.blur();
      }
    };

    return {
      readonly,
      disabled,
      realValue,
      booleanValue,
      boolTranslate,
      changeHandler
    };
  }
});
</script>
<style lang="scss">
.mobile-form-bool-switch {
  width: 100%;
  height: var(--oio-height-sm);
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .empty-value {
    color: var(--oio-disabled-color);
  }
}
</style>

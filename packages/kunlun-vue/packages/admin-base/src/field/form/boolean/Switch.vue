<template>
  <div class="form-bool-switch">
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
import { BooleanHelper, OioSwitch } from '@kunlun/vue-ui-antd';
import { computed, defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../basic';

export default defineComponent({
  components: {
    OioSwitch
  },
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [Boolean, String],
      default: undefined
    },
    defaultValue: {
      type: [Boolean, String]
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
.form-bool-switch {
  width: 100%;
  height: var(--oio-height);
  display: flex;
  align-items: center;
  color: var(--oio-text-color);

  .empty-value {
    color: var(--oio-disabled-color);
  }
}
</style>

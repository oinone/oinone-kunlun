<template>
  <div :class="`${DEFAULT_PREFIX}-action-item`" v-show="!invisible">
    <oio-popconfirm
      :placement="confirmPosition"
      :title="confirmTitle"
      :text="confirm"
      :enter-text="enterText"
      :cancel-text="cancelText"
      :condition="condition"
      :confirm-callback="() => !disabled && !readonly && validateAndClick(action, true)"
    >
      <oio-button
        ref="origin"
        size="normal"
        :type="type"
        :biz-style="bizStyle"
        :loading="loading"
        :disabled="disabled"
        :title="disabledTitle || label"
        :icon="icon"
        :data-action-name="action.name"
      >
        {{ label }}
      </oio-button>
    </oio-popconfirm>
    <slot />
  </div>
</template>

<script lang="ts">
import { OioButton, OioPopconfirm, DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { defineComponent } from 'vue';
import { ActionProps, useAction } from './typing';

export default defineComponent({
  name: 'DefaultAction',
  components: {
    OioButton,
    OioPopconfirm
  },
  inheritAttrs: false,
  props: {
    ...ActionProps
  },
  setup(props) {
    return {
      ...useAction(props),
      DEFAULT_PREFIX
    };
  }
});
</script>

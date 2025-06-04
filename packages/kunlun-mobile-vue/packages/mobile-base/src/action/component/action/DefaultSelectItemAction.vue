<template>
  <van-dropdown-item v-if="!invisible" :disabled="disabled" :title="disabledTitle || label">
    <oio-popconfirm
      :placement="confirmPosition"
      :text="confirm"
      :enter-text="enterText"
      :cancel-text="cancelText"
      :condition="condition"
      :confirm-callback="() => validateAndClick(action, true)"
    >
      <span>{{ label }}</span>
    </oio-popconfirm>
    <slot />
  </van-dropdown-item>
</template>

<script lang="ts">
import { OioPopconfirm } from '@oinone/kunlun-vue-ui-mobile-vant';
import { DropdownItem as VanDropdownItem } from 'vant';

import { defineComponent } from 'vue';
import { BaseActionProps, useAction } from './typing';

export default defineComponent({
  name: 'SelectItemAction',
  components: {
    OioPopconfirm,
    VanDropdownItem
  },
  inheritAttrs: false,
  props: {
    ...BaseActionProps
  },
  setup(props) {
    return {
      ...useAction(props)
    };
  }
});
</script>

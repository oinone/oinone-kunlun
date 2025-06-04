<template>
  <div class="form-input-password">
    <oio-input-password :value="value" @update:value="change" @blur="blur" @focus="focus" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OioInputPassword } from '@oinone/kunlun-vue-ui-mobile-vant';

export default defineComponent({
  inheritAttrs: false,
  props: ['value', 'change', 'blur', 'focus'],
  components: {
    OioInputPassword
  }
});
</script>

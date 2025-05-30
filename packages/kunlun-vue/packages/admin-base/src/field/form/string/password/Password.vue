<template>
  <div class="form-input-password">
    <oio-input-password :value="value" @update:value="change" @blur="blur" @focus="focus" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OioInputPassword } from '@kunlun/vue-ui-antd';

export default defineComponent({
  props: ['value', 'change', 'blur', 'focus'],
  components: {
    OioInputPassword
  }
});
</script>

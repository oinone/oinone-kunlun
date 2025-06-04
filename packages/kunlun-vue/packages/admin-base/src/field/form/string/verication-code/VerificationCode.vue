<template>
  <div class="form-verification-code-input" style="display: flex">
    <oio-input :value="value" @update:value="change" class="input" @blur="blur" @focus="focus" />
    <img :src="imageSrc" @click="reload" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { OioInput } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  props: ['imageSrc', 'reload', 'change', 'value', 'blur', 'focus'],
  components: {
    OioInput
  }
});
</script>

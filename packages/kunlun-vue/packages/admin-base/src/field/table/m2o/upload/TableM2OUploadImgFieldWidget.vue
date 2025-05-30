<template>
  <div class="wrap">
    <a-image :width="30" :src="value && value.url"></a-image>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Image as AImage } from 'ant-design-vue';

export default defineComponent({
  components: { AImage },
  props: ['value']
});
</script>

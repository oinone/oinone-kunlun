<template>
  <div class="mobile-search-image">
    <van-image v-for="(item, index) in value || []" :key="index" :width="20" :src="item && item.url" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Image as VanImage } from 'vant';

export default defineComponent({
  components: { VanImage },
  props: ['value']
});
</script>

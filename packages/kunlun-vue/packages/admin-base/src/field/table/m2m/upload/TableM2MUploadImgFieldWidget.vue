<template>
  <div class="search-image">
    <a-image-preview-group v-if="value && value.length">
      <a-image v-for="(item, index) in value || []" :key="index" :width="30" :src="item && item.url" />
    </a-image-preview-group>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Image as AImage, ImagePreviewGroup as AImagePreviewGroup } from 'ant-design-vue';

export default defineComponent({
  components: { AImagePreviewGroup, AImage },
  props: ['value']
});
</script>

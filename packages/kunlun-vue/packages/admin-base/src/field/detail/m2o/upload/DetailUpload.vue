<template>
  <a v-if="value" :href="value.url" download>
    <download-outlined />
    {{ value.name }}
  </a>
  <span v-else>-</span>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  inheritAttrs: false,
  components: { DownloadOutlined },
  props: {
    value: {
      type: Object
    }
  }
});
</script>

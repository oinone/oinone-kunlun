<template>
  <a :href="href">
    <download-outlined />
    {{ filename }}
  </a>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  inheritAttrs: false,
  components: { DownloadOutlined },
  props: ['href', 'filename']
});
</script>

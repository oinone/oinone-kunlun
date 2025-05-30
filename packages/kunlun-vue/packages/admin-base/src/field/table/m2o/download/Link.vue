<template>
  <div>
    <a :href="href" target="_blank" download>
      <download-outlined />
      {{ filename }}
    </a>
  </div>
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

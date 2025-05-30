<template>
  <div class="divider-container">
    <a-divider type="vertical" style="height: 16px; margin-top: 2px" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Divider } from 'ant-design-vue';

export default defineComponent({
  components: {
    ADivider: Divider
  }
});
</script>

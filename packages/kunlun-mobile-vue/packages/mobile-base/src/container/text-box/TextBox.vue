<template>
  <div class="container mobile-text-box-group" v-if="!invisible" :style="{ width }">
    <div class="ant-col ant-form-item-label">
      <label>{{ title }}</label>
    </div>
    <div class="ant-col ant-form-item-control-wrapper">
      {{ currentValue }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['width', 'currentValue', 'invisible', 'title'],
});
</script>

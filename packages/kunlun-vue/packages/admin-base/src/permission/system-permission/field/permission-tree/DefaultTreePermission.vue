<template>
  <a-tree ref="treeNode" class="oio-tree" :tree-data="treeData">
    <template #title="{ title, data }">
      <div>
        {{ title }}
      </div>
    </template>
  </a-tree>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['treeData']
});
</script>

<template>
  <div class="table-string-tag">
    <span class="table-string-tag-option" v-for="item in value" :key="item">
      <span class="table-string-tag-option-font">
        {{ item }}
      </span>
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: ['value']
});
</script>

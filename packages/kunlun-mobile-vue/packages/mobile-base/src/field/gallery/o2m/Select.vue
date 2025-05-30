<template>
  <gallery-common-field :justify-content="justifyContent" :value="currentValueStr" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import GalleryCommonField from '../common/GalleryCommonField.vue';

export default defineComponent({
  components: {
    GalleryCommonField
  },
  inheritAttrs: false,
  props: {
    currentValueStr: {
      type: String
    },
    justifyContent: {
      type: String
    },
    emptyStyle: {
      type: String
    }
  }
});
</script>

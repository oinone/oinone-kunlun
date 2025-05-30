<template>
  <gallery-common-field :value="currentValue ? currentValue.label : undefined" :justify-content="justifyContent" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import GalleryCommonField from '../common/GalleryCommonField.vue';

export default defineComponent({
  props: {
    currentValue: {
      type: Object
    },
    justifyContent: {
      type: String
    },
    emptyStyle: {
      type: String
    }
  },
  components: { GalleryCommonField },
  inheritAttrs: false
});
</script>

<template>
  <detail-common-field :value="value" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DetailCommonField from '../../detail/common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField },
  props: {
    value: {},
    emptyStyle: {
      type: String
    }
  }
});
</script>

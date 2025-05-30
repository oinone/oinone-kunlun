<template>
  <div v-if="currentValue.length > 0" class="detail-multi-select">
    <div class="detail-multi-select-item" v-for="item in currentValue" :key="item.value">
      <div class="detail-multi-select-item-font" :title="item.label">
        {{ item.label }}
      </div>
    </div>
  </div>
  <div v-else>
    <detail-common-field :empty-style="emptyStyle" />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  props: {
    currentValue: {
      type: Array as PropType<Array<any>>,
      default: () => [],
      required: true
    },
    emptyStyle: {
      type: String
    }
  },
  components: { DetailCommonField }
});
</script>

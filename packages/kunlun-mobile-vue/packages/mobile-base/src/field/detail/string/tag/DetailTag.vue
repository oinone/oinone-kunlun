<template>
  <div v-if="displayNameList.length > 0" class="mobile-detail-multi-select">
    <div class="mobile-detail-multi-select-item" v-for="item in displayNameList" :key="item">
      <div class="mobile-detail-multi-select-item-font" :title="item">
        {{ item }}
      </div>
    </div>
  </div>
  <div v-else>
    <detail-common-field :empty-style="emptyStyle" />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DetailCommonField from '../../common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField },
  inheritAttrs: false,
  props: {
    displayNameList: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    emptyStyle: {
      type: String
    }
  }
});
</script>

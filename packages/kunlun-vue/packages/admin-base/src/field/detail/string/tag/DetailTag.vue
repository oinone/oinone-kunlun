<template>
  <detail-common-field :is-empty="!list.length" :empty-style="emptyStyle">
    <div class="detail-multi-select">
      <div class="detail-multi-select-item" v-for="item in list" :key="item">
        <div class="detail-multi-select-item-font" :title="item" v-html="item"></div>
      </div>
    </div>
  </detail-common-field>
</template>
<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { RuntimeModelField } from '@oinone/kunlun-engine';

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
    },
    field: {
      type: Object as PropType<RuntimeModelField>
    }
  },

  setup(props) {
    const list = computed(() => {
      return props.displayNameList.map((v) => (v ? v.replace(/\r?\n/g, '<br/>') : ''));
    });

    return { list };
  }
});
</script>

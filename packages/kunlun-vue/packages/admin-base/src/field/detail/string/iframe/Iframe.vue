<template>
  <detail-common-field
    :class="[value ? 'iframe-detail-common-field' : 'iframe-detail-common-field-empty']"
    :value="value"
    :empty-style="emptyStyle"
  >
    <template #default="{ realValue }">
      <div class="detail-iframe">
        <iframe :src="realValue" frameborder="0"></iframe>
      </div>
    </template>
  </detail-common-field>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DetailCommonField from '../../common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField },
  props: {
    value: {
      type: String
    },
    emptyStyle: {
      type: String
    }
  }
});
</script>
<style lang="scss">
.iframe-detail-common-field {
  display: block;
  width: 100%;
  height: 700px;

  .detail-iframe {
    height: 100%;

    iframe {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

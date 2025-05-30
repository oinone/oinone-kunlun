<template>
  <gallery-common-field
    :class="[value || defaultValue ? 'iframe-detail-common-field' : 'iframe-detail-common-field-empty']"
    :value="value || defaultValue"
    :justify-content="justifyContent"
    :empty-style="emptyStyle"
  >
    <template #default="{ realValue }">
      <div class="detail-iframe">
        <iframe :src="realValue" frameborder="0"></iframe>
      </div>
    </template>
  </gallery-common-field>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  components: { GalleryCommonField },
  props: {
    value: {
      type: String
    },
    defaultValue: {
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

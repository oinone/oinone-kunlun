<template>
  <gallery-common-field :value="value" :justify-content="justifyContent" :empty-style="emptyStyle">
    <template #default>
      <div class="gallery-string-hyperlinks-wrapper" @click.stop>
        <a :href="value" class="gallery-string-hyperlinks" :target="target" :title="value">{{ text || value }}</a>
      </div>
    </template>
  </gallery-common-field>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'GalleryHyperlinks',
  inheritAttrs: false,
  components: { GalleryCommonField },
  props: {
    value: {
      type: String
    },
    text: {
      type: String
    },
    target: {
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
.gallery-string-hyperlinks {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

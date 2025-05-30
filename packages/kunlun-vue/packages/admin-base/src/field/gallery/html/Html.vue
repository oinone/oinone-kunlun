<template>
  <gallery-common-field :value="value" :justify-content="justifyContent" :empty-style="emptyStyle">
    <div class="gallery-html" v-auto-hidden="{ height: showHeight, isFold: true }" v-html="value" />
  </gallery-common-field>
</template>
<script lang="ts">
import { StyleHelper } from '@kunlun/vue-ui-common';
import { computed, defineComponent } from 'vue';
import GalleryCommonField from '../common/GalleryCommonField.vue';

export default defineComponent({
  components: {
    GalleryCommonField
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    label: {
      type: String
    },
    justifyContent: {
      type: String
    },
    showHeight: {
      type: [Number, String]
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const showHeight = computed(() => StyleHelper.px(props.showHeight) || 200);

    return {
      showHeight
    };
  }
});
</script>
<style>
.gallery-html {
  width: 100%;
  padding-top: 5px;
}
</style>

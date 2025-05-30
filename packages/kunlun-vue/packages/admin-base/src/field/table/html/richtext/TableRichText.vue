<template>
  <div class="table-html-rich-text">
    <div class="empty-value" v-if="!value">-</div>
    <a v-else @click.stop="showDialog">{{ translateValueByKey('查看') }}</a>
  </div>

  <oio-modal v-model:visible="visible" :title="title" width="80%" :has-footer="false">
    <preview-html v-if="visible" class="table-html-rich-text-iframe" :html="value" />
  </oio-modal>
</template>
<script lang="ts">
import { OioModal } from '@kunlun/vue-ui-antd';
import { defineComponent, ref } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import { PreviewHtml } from '../../../../components/common';

export default defineComponent({
  components: {
    OioModal,
    PreviewHtml
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    title: {
      type: String
    }
  },
  setup() {
    const visible = ref(false);
    const showDialog = () => {
      visible.value = true;
    };

    return {
      visible,
      showDialog,
      translateValueByKey
    };
  }
});
</script>

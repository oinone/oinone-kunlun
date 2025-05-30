<template>
  <div :class="`${DEFAULT_PREFIX}-notice-page`">
    <div class="title">{{ translateValueByKey('如需浏览，请复制网址后用浏览器访问') }}</div>
    <div class="url">{{ url }}</div>
    <div class="cop-btn-wrapper">
      <oio-button type="primary" class="copy-btn" @click="copyUrl">{{ translateValueByKey('复制链接') }}</oio-button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { OioButton, DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';
import { translateValueByKey } from '@kunlun/engine';
import { Toast } from 'vant';
import { useMatched } from '@kunlun/router';
import { copyText } from '../../util';

export default defineComponent({
  components: {
    OioButton
  },
  props: [],
  setup() {
    const { matched } = useMatched();
    const url = computed(() => decodeURIComponent(matched?.segmentParams?.notice?.url || ''));
    function copyUrl() {
      copyText(url.value);
      Toast.success(translateValueByKey('复制成功！'));
    }
    return {
      url,
      copyUrl,
      DEFAULT_PREFIX,
      translateValueByKey
    };
  }
});
</script>

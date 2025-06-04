<template>
  <match :rootToken="root">
    <template v-for="page in pages" :key="page.widget">
      <route v-if="page.widget" :path="page.path" :slotName="page.slotName" :widget="page.widget">
        <slot :name="page.slotName" />
      </route>
    </template>

    <route :path="pagePath" slotName="page" :widgets="{ page: widgets.page }">
      <slot name="page" />
    </route>

    <route path="/" slotName="homePage">
      <slot name="homePage" />
    </route>
  </match>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { UrlHelper } from '@oinone/kunlun-shared';
import { Locale } from 'vant';
import zhCN from 'vant/es/locale/lang/zh-CN';
import enUS from 'vant/es/locale/lang/en-US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

const LANG_MAP = {
  'zh-CN': zhCN,
  'en-US': enUS
};

export default defineComponent({
  props: ['widgets', 'root', 'pages'],
  inheritAttrs: false,
  setup() {
    const pagePath = computed(() => UrlHelper.append(UrlHelper.absolutePath(process.env.BASE_PATH), 'page'));

    const locale = ref('zh-CN');
    onMounted(() => {
      const lang = localStorage.getItem('language') || ('zh-CN' as any);
      locale.value = lang === 'zh-CN' ? 'zh-CN' : 'en-US';
      dayjs.locale(locale.value);
      Locale.use(locale.value, LANG_MAP[locale.value] || zhCN);
    });

    return {
      zhCN,
      enUS,
      locale,
      pagePath
    };
  }
});
</script>

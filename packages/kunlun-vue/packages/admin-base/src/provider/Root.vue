<template>
  <a-config-provider :locale="locale === 'zh-cn' ? zhCN : enUS">
    <el-config-provider :locale="locale === 'zh-cn' ? elZhCn : elEn">
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
    </el-config-provider>
  </a-config-provider>
</template>

<script lang="ts">
import { CurrentLanguage } from '@kunlun/engine';
import { UrlHelper } from '@kunlun/shared';
import { ZH_CN_CODE } from '@kunlun/vue-ui-common';
import { ConfigProvider as AConfigProvider } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/lib/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ElConfigProvider } from 'element-plus';
import elEn from 'element-plus/dist/locale/en.mjs';
import elZhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';

export default defineComponent({
  components: { AConfigProvider, ElConfigProvider },
  props: ['widgets', 'loginUrl', 'root', 'pages'],
  inheritAttrs: false,
  setup() {
    const pagePath = computed(() => UrlHelper.append(UrlHelper.absolutePath(process.env.BASE_PATH), 'page'));

    const locale = ref(zhCN.locale);

    const refreshLocale = (languageCode: string) => {
      locale.value = languageCode === ZH_CN_CODE ? zhCN.locale : enUS.locale;
      dayjs.locale(locale.value);
    };

    onMounted(() => {
      refreshLocale(CurrentLanguage.getCodeByLocalStorage());
      CurrentLanguage.onRefreshLocalStorage(refreshLocale);
    });

    onUnmounted(() => {
      CurrentLanguage.clearOnRefreshLocalStorage(refreshLocale);
    });

    return {
      zhCN,
      enUS,
      elZhCn,
      elEn,
      locale,
      pagePath
    };
  }
});
</script>

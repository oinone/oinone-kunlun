<template>
  <a-config-provider :locale="locale === 'zh-cn' ? zhCN : enUS">
    <el-config-provider :locale="locale === 'zh-cn' ? elZhCn : elEn">
      <slot />
    </el-config-provider>
  </a-config-provider>
</template>

<script lang="ts">
import { ConfigProvider as AConfigProvider } from 'ant-design-vue';
import enUS from 'ant-design-vue/es/locale/en_US';
import zhCN from 'ant-design-vue/lib/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ElConfigProvider } from 'element-plus';
import elEn from 'element-plus/dist/locale/en.mjs';
import elZhCn from 'element-plus/dist/locale/zh-cn.mjs';
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  components: { AConfigProvider, ElConfigProvider },
  inheritAttrs: false,
  setup() {
    const locale = ref(zhCN.locale);
    onMounted(() => {
      const lang = localStorage.getItem('language') || ('zh-CN' as any);
      locale.value = lang === 'zh-CN' ? zhCN.locale : enUS.locale;
      dayjs.locale(locale.value);
    });

    return {
      zhCN,
      enUS,
      elZhCn,
      elEn,
      locale
    };
  }
});
</script>

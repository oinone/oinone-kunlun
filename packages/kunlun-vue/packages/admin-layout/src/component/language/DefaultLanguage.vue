<template>
  <a-dropdown :trigger="['click']" placement="bottom">
    <div v-if="currentLanguage" class="k-layout-lang">
      <span>
        <div
          v-if="currentIsChinese"
          class="country-logo"
          :class="[currentLanguage.code]"
          :style="{
            'background-image': `url(${genStaticPath('country.png')})`
          }"
        ></div>
        <oio-icon v-else :icon="currentLanguage.icon" size="18px" style="margin-right: 10px"></oio-icon>
        {{ currentLanguage.name }}
      </span>
      <caret-down-outlined :style="{ fontSize: '12px', color: 'var(--oio-icon-color)' }" />
    </div>
    <template #overlay>
      <a-menu class="k-language-dropdown">
        <a-menu-item v-for="language of languages" :key="language.code" @click="onChange(language)">
          <div style="display: flex; align-items: center">
            <div
              v-if="isChinese(language)"
              class="country-logo"
              :style="{
                'background-image': `url(${genStaticPath('country.png')})`
              }"
              :class="[language.code]"
            ></div>
            <oio-icon
              v-else
              :icon="language.icon"
              size="18px"
              style="vertical-align: middle; margin-right: 6px"
            ></oio-icon>
            {{ language.name }}
          </div>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts">
import { CaretDownOutlined } from '@ant-design/icons-vue';
import { OioIcon } from '@kunlun/vue-ui-antd';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';
import { RuntimeLanguage, ZH_CN_CODE } from '@kunlun/vue-ui-common';

export default defineComponent({
  name: 'DefaultLanguage',
  inheritAttrs: false,
  components: {
    ADropdown,
    AMenu,
    AMenuItem,
    CaretDownOutlined,
    OioIcon
  },
  props: {
    languages: {
      type: Array as PropType<RuntimeLanguage[]>
    },
    currentLanguage: {
      type: Object as PropType<RuntimeLanguage>
    },
    onChange: {
      type: Function
    },
    genStaticPath: {
      type: Function
    }
  },
  setup(props) {
    const languages = computed(() => {
      return props.languages || [];
    });

    const currentIsChinese = computed(() => {
      return isChinese(props.currentLanguage);
    });

    const isChinese = (language: RuntimeLanguage | undefined) => {
      return language?.code === ZH_CN_CODE;
    };

    return {
      languages,
      currentIsChinese,

      isChinese
    };
  }
});
</script>

<style lang="scss">
.country-logo {
  box-shadow: 0 0 1px 0 #888;
  background-repeat: no-repeat;
  background-color: #dbdbdb;
  background-position: 20px 0;
  width: 18px;
  height: 12px;
  margin-right: 6px;
}

.zh-CN {
  background-position: -1049px 0;
}
</style>

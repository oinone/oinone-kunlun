<template>
  <div class="system-style system-setting-page-view">
    <div class="system-style-left">
      <!-- 主题模式 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('主题模式') }}</div>
        </div>
        <a-radio-group v-model:value="mode">
          <div class="flex-s-c">
            <div class="light-mode margin-right">
              <div class="light-mode-image" :class="[mode === 'default' && 'active']" @click="mode = 'default'">
                <img :src="lightMode()" alt="" style="width: 100%; height: 100%" />
              </div>
              <a-radio style="color: var(--oio-text-color)" value="default">{{
                translateValueByKey('浅色模式')
              }}</a-radio>
            </div>
            <div class="dark-mode">
              <div class="dark-mode-image" :class="[mode === 'dark' && 'active']" @click="mode = 'dark'">
                <img :src="darkMode()" alt="" style="width: 100%; height: 100%" />
              </div>
              <a-radio style="color: var(--oio-text-color)" value="dark">{{ translateValueByKey('深色模式') }}</a-radio>
            </div>
          </div>
        </a-radio-group>
      </div>

      <!-- 尺寸 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('尺寸') }}</div>
        </div>
        <a-radio-group v-model:value="size">
          <a-radio style="color: var(--oio-text-color)" value="large">{{ translateValueByKey('大') }}</a-radio>
          <a-radio style="color: var(--oio-text-color)" value="medium">{{ translateValueByKey('中') }}</a-radio>
          <a-radio style="color: var(--oio-text-color)" value="small">{{ translateValueByKey('小') }}</a-radio>
        </a-radio-group>
      </div>

      <!--  侧边栏颜色 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('侧边栏颜色') }}</div>
        </div>
        <a-radio-group v-model:value="currentMenuColor">
          <div class="flex-s-c common-layout-list">
            <div
              class="common-layout-item"
              v-for="(menuItem, index) in menuColorList"
              :key="index"
              :class="[currentMenuColor === menuItem.style && 'active']"
            >
              <a-popover overlayClassName="oio-popover" title="" trigger="hover">
                <template #content>
                  <img :src="menuItem.image" alt="" style="width: 500px; height: auto" />
                </template>
                <div class="common-layout-item-image" @click="currentMenuColor = menuItem.style">
                  <img :src="menuItem.image" alt="" style="width: 200px" />
                </div>
              </a-popover>

              <a-radio style="color: var(--oio-text-color)" :value="menuItem.style">{{ menuItem.title }}</a-radio>
            </div>
          </div>
        </a-radio-group>
      </div>

      <!--  侧边栏样式 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('侧边栏样式') }}</div>
        </div>
        <a-radio-group v-model:value="currentSidebar">
          <div class="flex-s-c common-layout-list">
            <div
              class="common-layout-item"
              v-for="(sidebar, index) in sidebarList"
              :key="index"
              :class="[currentSidebar === sidebar.style && 'active']"
            >
              <a-popover overlayClassName="oio-popover" title="" trigger="hover">
                <template #content>
                  <img :src="sidebar.image" alt="" style="width: 500px; height: auto" />
                </template>
                <div class="common-layout-item-image" @click="currentSidebar = sidebar.style">
                  <img :src="sidebar.image" alt="" style="width: 100%; height: 100%" />
                </div>
              </a-popover>

              <a-radio style="color: var(--oio-text-color)" :value="sidebar.style">{{ sidebar.title }}</a-radio>
            </div>
          </div>
        </a-radio-group>
      </div>

      <!--  多tab栏样式 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('多tab栏样式') }}</div>
        </div>
        <a-form>
          <a-row>
            <a-col :span="24">
              <a-form-item :label="$translate('标签页')">
                <a-switch class="oio-switch" v-model:checked="enabled" @change="onEnabledChange" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-show="enabled" class="multitab-config">
            <a-col :span="24">
              <a-row class="multitab-config-container">
                <a-col :span="4" class="checkbox-center">
                  <a-checkbox v-model:checked="draggable" @change="onDraggableChange">
                    {{ $translate('拖拽排序') }}
                  </a-checkbox>
                </a-col>
                <a-col :span="4" class="checkbox-center form-field-widget label-with-tooltip">
                  <a-checkbox v-model:checked="showModuleLogo" @change="onShowModuleLogoChange">
                    <span :title="$translate('显示应用Logo')">{{ $translate('显示应用Logo') }}</span>
                    <a-tooltip :title="$translate('标签页显示应用图标')">
                      <QuestionCircleOutlined class="question-icon"></QuestionCircleOutlined>
                    </a-tooltip>
                  </a-checkbox>
                </a-col>
                <a-col :span="4" class="checkbox-center form-field-widget label-with-tooltip">
                  <a-checkbox v-model:checked="homepageEnabled" @change="onHomepageEnabledChange">
                    <span :title="$translate('固定首页')">{{ $translate('固定首页') }}</span>
                    <a-tooltip :title="$translate('将优先级最高的应用首页永远设为首个标签页')">
                      <QuestionCircleOutlined class="question-icon"></QuestionCircleOutlined>
                    </a-tooltip>
                  </a-checkbox>
                </a-col>
                <a-col :span="4" class="checkbox-center">
                  <a-checkbox v-model:checked="homepageAutoInvisible" @change="onHomepageAutoInvisibleChange">
                    {{ $translate('首页自动隐藏') }}
                  </a-checkbox>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-form>
        <a-radio-group v-show="enabled" v-model:value="inline" style="margin-bottom: var(--oio-margin)">
          <a-radio :value="false" style="color: var(--oio-text-color)">{{
            translateValueByKey('外部多tab栏')
          }}</a-radio>
          <a-radio :value="true" style="color: var(--oio-text-color)">{{ translateValueByKey('内部多tab栏') }}</a-radio>
        </a-radio-group>
        <a-radio-group v-show="enabled" v-model:value="theme">
          <div class="flex-s-c common-layout-list" style="flex-wrap: wrap">
            <div
              class="common-layout-item"
              style="width: calc(25% - var(--oio-margin) * 3 / 4)"
              v-for="(tab, index) in tabList"
              :key="index"
              :class="[theme === tab.style && 'active']"
            >
              <a-popover overlayClassName="oio-popover" title="" trigger="hover">
                <template #content>
                  <img :src="tab.image" alt="" style="width: 500px; height: auto" />
                </template>

                <div class="common-layout-item-image" @click="theme = tab.style">
                  <img :src="tab.image" alt="" style="width: 100%; height: 100%" />
                </div>
              </a-popover>
              <a-radio style="color: var(--oio-text-color)" :value="tab.style">{{ tab.title }}</a-radio>
            </div>
          </div>
        </a-radio-group>
      </div>

      <div class="flex-s-c margin-top" style="margin-top: var(--oio-margin)">
        <oio-button class="margin-right" @click="onBack">{{ translateValueByKey('返回') }}</oio-button>
        <oio-button type="primary" class="margin-right" @click="onSaveSystemConfig(mode, size)">{{
          translateValueByKey('发布')
        }}</oio-button>
        <oio-button type="primary" @click="onDownloadTheme">{{ translateValueByKey('下载') }}</oio-button>
      </div>
    </div>

    <!-- 效果预览 -->
    <div class="system-style-right flex-1">
      <div class="oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('效果预览') }}</div>
        </div>
      </div>
      <div class="system-style-right-main">
        <div class="host-main">
          <img style="height: 498.65px; width: 600px" :src="hostImage()" alt="" ref="hostRef" />
          <div
            class="system-style-preview"
            ref="loginPageRef"
            :class="[isFullScreen && 'system-style-preview-fullscreen']"
          >
            <div class="system-style-preview-block">
              <img
                alt=""
                style="width: 100%; height: 100%"
                :src="currentThemeImage"
                :style="{
                  'object-fit': isFullScreen ? 'contain' : 'cover'
                }"
              />
            </div>
          </div>
        </div>

        <div>
          <div class="full-page flex-c-c" @click="onFullPage">
            <OioIcon icon="oinone-quanping" color="#fff"></OioIcon>
            <span>{{ translateValueByKey('全屏') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, defineProps, watchEffect, watch } from 'vue';
import { getTheme } from '@kunlun/theme';
import { OioIcon, OioButton } from '@kunlun/vue-ui-antd';
import {
  translateValueByKey,
  SideBarThemeColor,
  SideBarTheme,
  MultiTabTheme,
  MajorConfig,
  MultiTabsApplicationHomepageConfig
} from '@kunlun/engine';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';

import { useFullscreen } from '../../util';
import { localSystemTheme, hostImage, lightMode, darkMode } from './localData';

const props = defineProps<{
  systemConfig: MajorConfig;
  onSaveSystemConfig: (m: string, s: string) => void;
  goBack: () => void;
}>();

const loginPageRef = ref<HTMLElement>('' as any);

const hostRef = ref();
const mode = ref('default');
const size = ref('medium');
const currentMenuColor = ref(SideBarThemeColor.default);
const currentSidebar = ref(SideBarTheme.side1);

// 多 tab 主题
const enabled = ref<boolean>(true); // 是否启用多 tab
const draggable = ref<boolean>(true); // 是否启用拖拽排序
const showModuleLogo = ref<boolean>(true); // 是否启用应用 logo
const homepageEnabled = ref<boolean>(true); // 是否恒定应用主 tab 页
const homepageAutoInvisible = ref<boolean>(true); // 是否首页自动隐藏
const theme = ref<string>(MultiTabTheme.tab1); // 多 tab 主题
const inline = ref(false); // 多 tab 是否内联

/**
 * 数据回填
 */
watchEffect(() => {
  const { mode: m, size: s, multiTabTheme, sideBarTheme, extend } = props.systemConfig;

  if (m) {
    mode.value = m.toLocaleLowerCase();
  }

  if (s) {
    size.value = s.toLocaleLowerCase();
  }

  const extendMultiTabTheme = extend?.systemStyleConfig?.multiTabConfig;
  if (extendMultiTabTheme || multiTabTheme) {
    inline.value = extendMultiTabTheme?.inline ?? multiTabTheme?.inline! ?? false;
    theme.value = extendMultiTabTheme?.theme ?? multiTabTheme?.theme! ?? MultiTabTheme.tab1;
    enabled.value = extendMultiTabTheme?.enabled ?? true;
    draggable.value = extendMultiTabTheme?.draggable ?? true;
    showModuleLogo.value = extendMultiTabTheme?.showModuleLogo ?? true;
    homepageEnabled.value = (extendMultiTabTheme?.homepage as MultiTabsApplicationHomepageConfig)?.enabled ?? true;
    homepageAutoInvisible.value =
      (extendMultiTabTheme?.homepage as MultiTabsApplicationHomepageConfig)?.autoInvisible ?? !inline.value;
  }

  const extendSideBarTheme = extend?.systemStyleConfig?.sideBarConfig;
  if (extendSideBarTheme || sideBarTheme) {
    currentMenuColor.value =
      extendSideBarTheme?.mode?.toLocaleLowerCase() ??
      (sideBarTheme?.mode?.toLocaleLowerCase() as any) ??
      SideBarThemeColor.default;
    currentSidebar.value = extendSideBarTheme?.theme ?? sideBarTheme?.theme! ?? SideBarTheme.side1;
  }
});

const currentThemeImage = computed(() => {
  const theme = `${mode.value}-${size.value}`;

  return localSystemTheme.previewImages[theme as any];
});

const menuColorList = computed(() => {
  if (mode.value === 'default') {
    return localSystemTheme.defaultMenuColors;
  }

  return localSystemTheme.darkMenuColors;
});

const sidebarList = computed(() => {
  if (mode.value === 'default') {
    return localSystemTheme.DefaultSideBarThemes;
  }

  return localSystemTheme.darkSideBarThemes;
});

const tabList = computed(() => {
  if (mode.value === 'default') {
    return localSystemTheme.defaultMultiTabThemes(inline.value);
  }

  return localSystemTheme.darkMultiTabThemes(inline.value);
});

// 全屏
const { isFullScreen, trigger } = useFullscreen(loginPageRef);

// 多 tab 配置修改事件
const setMultiTabConfig = (path: string, value: unknown) => {
  const pathArr = path.split('.');
  let obj = props.systemConfig;
  while (pathArr.length > 1) {
    const key = pathArr.shift();
    if (key) {
      if (!obj[key]) {
        obj[key] = {};
      }
      obj = obj[key];

      if (pathArr.length === 1) {
        obj[pathArr[0]] = value;
      }
    }
  }
};

const onEnabledChange = (value: boolean) => {
  setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.enabled', value);
};
const onDraggableChange = (value: any) => {
  setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.draggable', value.target.checked);
};
const onShowModuleLogoChange = (value: any) => {
  setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.showModuleLogo', value.target.checked);
};
const onHomepageEnabledChange = (value: any) => {
  setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.homepage.enabled', value.target.checked);
};
const onHomepageAutoInvisibleChange = (value: any) => {
  setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.homepage.autoInvisible', value.target.checked);
};

watch(
  () => [mode.value, size.value, currentMenuColor.value, currentSidebar.value, theme.value, inline.value],
  (arr) => {
    const [m, s, menuColor, menuTheme, theme, inline] = arr;
    props.systemConfig.mode = (m as string).toLocaleUpperCase();
    props.systemConfig.size = (s as string).toLocaleUpperCase();
    props.systemConfig.sideBarTheme = {
      mode: (menuColor as string).toLocaleUpperCase() as SideBarThemeColor,
      theme: menuTheme as SideBarTheme
    };
    props.systemConfig.multiTabTheme = {
      inline: inline as boolean,
      theme: theme as MultiTabTheme
    };
    if (!props.systemConfig.extend) {
      props.systemConfig.extend = {};
    }
    setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.theme', theme as MultiTabTheme);
    setMultiTabConfig('extend.systemStyleConfig.multiTabConfig.inline', inline as boolean);
    setMultiTabConfig('extend.systemStyleConfig.sideBarConfig.mode', (menuColor as string).toLocaleUpperCase());
    setMultiTabConfig('extend.systemStyleConfig.sideBarConfig.theme', menuTheme as SideBarTheme);
  }
);

const onBack = () => {
  props.goBack();
};

const onFullPage = () => {
  trigger();
};

const onDownloadTheme = () => {
  const theme = getTheme(`${mode.value}-${size.value}`);
  const prefixName = mode.value === 'default' ? translateValueByKey('浅色') : translateValueByKey('深色');
  // eslint-disable-next-line no-nested-ternary
  const suffixName =
    size.value === 'large'
      ? translateValueByKey('大主题')
      : size.value === 'medium'
      ? translateValueByKey('中主题')
      : translateValueByKey('小主题');

  const data = JSON.stringify(theme);
  const blob = new Blob([data], { type: 'application/json' });
  let link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${prefixName}${suffixName}.json`;
  link.click();

  link = null as any;
};
</script>
<style lang="scss">
.system-style {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  &-left {
    width: 900px;
    margin-right: 86px;

    .light-mode,
    .dark-mode {
      text-align: center;
    }

    .light-mode-image,
    .dark-mode-image {
      width: 200px;
      height: 168px;
      border-radius: 10px;
      border: 2px solid transparent;
      box-sizing: border-box;
      cursor: pointer;
      margin-bottom: var(--oio-margin);

      &.active {
        border-color: var(--oio-primary-color);
        overflow: hidden;
      }
    }

    .common-layout-list {
      gap: var(--oio-margin);
      .common-layout-item {
        text-align: center;
        .common-layout-item-image {
          cursor: pointer;
        }
        img {
          border: 1px solid var(--oio-border-color);
          border-radius: var(--oio-border-radius);
        }

        &.active {
          img {
            border-color: var(--oio-primary-color);
          }
        }
      }

      .ant-radio-wrapper {
        margin-top: var(--oio-margin);
      }
    }

    .multitab-config {
      margin-bottom: 24px;

      .multitab-config-container {
        padding: 12px;
        background-color: #f5f6f8;
        border-radius: var(--oio-border-radius);

        .checkbox-center {
          display: flex;
          align-items: center;
        }

        .form-field-widget.label-with-tooltip {
          & > .ant-form-item-label {
            height: 32px;
            line-height: 32px;
          }
        }
      }
    }
  }

  &-right {
    .system-style-right-main {
      display: inline-block;
      text-align: center;

      .host-main {
        position: relative;
      }

      .system-style-preview {
        position: absolute;
        left: 20px;
        top: 20px;
        width: 560px;
        height: 318px;

        &::after {
          content: '';
          position: absolute;
          width: 100%;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 1;
        }

        .system-style-preview-block {
          width: 100%;
          height: 100%;
        }
      }

      .full-page {
        display: inline-block;
        margin-top: 12px;
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        cursor: pointer;
        color: #fff;

        .oio-icon {
          vertical-align: baseline;
        }

        span {
          &:last-child {
            margin-left: 6px;
          }
        }
      }
    }
  }
}
</style>

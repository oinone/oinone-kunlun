<template>
  <div class="login-page" :style="loginContainerStyle" :key="node_code">
    <video
      ref="videoRef"
      loop
      autoplay
      muted
      class="login-page-strick-video"
      v-if="isVideoBackground && !isStandLayout"
      :controls="false"
      :src="backgroundImage"
    ></video>

    <!-- logo在页面左上角 -->
    <div class="login-page-container-img" v-if="logoInLeft" :style="logoStyle">
      <img v-if="loginPageLogo" :src="loginPageLogo" alt="logo" />
    </div>

    <div class="login-page-container" @keyup.enter="login" :style="loginBlockStyle">
      <div v-if="enableI18n && currentLanguage && currentLanguage.name" class="login-language-wrapper">
        <a-dropdown>
          <div class="login-language-current-row">
            <oio-icon icon="oinone-a-yuyanxuanze4x" size="14" color="var(--oio-text-color-secondary)" />
            <span class="login-language-current">{{ currentLanguage.name }}</span>
            <oio-icon icon="oinone-zhutixiala" size="10" color="var(--oio-text-color-secondary)" />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="language in languages" :key="language.code" @click="() => onLanguageChange(language)">
                {{ language.name }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <!-- 账号登录 -->
      <div class="login-page-title">{{ translateValueByKey(accountLoginLabel) }}</div>
      <oio-form :data="authForm" class="login-page-form">
        <oio-form-item
          name="login"
          :help="error['login']"
          :validateStatus="error['login'] || error['password'] ? 'error' : ''"
        >
          <oio-input
            class="login-input"
            :placeholder="translateValueByKey(accountPlaceholder)"
            v-model:value="authForm.login"
            @blur="loginBlur"
            @change="clearErrorMessage"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </oio-input>
        </oio-form-item>
        <oio-form-item
          name="password"
          :help="error['password']"
          :validateStatus="error['login'] || error['password'] ? 'error' : ''"
        >
          <a-input-password
            class="login-input"
            :placeholder="translateValueByKey(passwordPlaceholder)"
            v-model:value="authForm.password"
            @change="clearErrorMessage"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </oio-form-item>
      </oio-form>
      <oio-button type="primary" block @click="login">{{ translateValueByKey(loginLabel) }}</oio-button>
    </div>
    <div
      class="login-page-ugly-bg"
      v-if="isStandLayout"
      :style="{
        backgroundImage: `url(${backgroundImage})`
      }"
    >
      <video
        ref="videoRef"
        loop
        autoplay
        muted
        class="login-page-video"
        v-if="isVideoBackground"
        :controls="false"
        :src="backgroundImage"
      ></video>
    </div>

    <div class="login-page-footer" v-if="copyrightStatus">
      <div>
        Copyrights ©{{ copyright.year }}
        <span style="cursor: pointer" @click="onCompanyUrl">{{ translateValueByKey(copyright.company) }}</span>
      </div>
      <div>{{ copyright.icp }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import { genStaticPath, getCopyrightStatus, OioLoginLogoPosition, type OioLoginThemeConfig, OioLoginThemeName, translateValueByKey } from '@oinone/kunlun-engine';
import { OioButton, OioForm, OioFormItem, OioIcon, OioInput, VIDEO_SUFFIX_LIST } from '@oinone/kunlun-vue-ui-antd';
import type { LoginData, RuntimeLanguage } from '@oinone/kunlun-vue-ui-common';
import { Dropdown as ADropdown, InputPassword as AInputPassword, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { computed, defineProps, nextTick, onActivated, type PropType, ref } from 'vue';

const props = defineProps({
  loginMethod: { type: String, required: true },
  loginUrl: { type: String, required: true },
  login: { type: Function as PropType<() => void>, required: true },
  loginBlur: { type: Function as PropType<() => void>, required: false },
  error: { type: Object as PropType<LoginData>, required: true },
  clearErrorMessage: { type: Function as PropType<() => void>, required: true },
  authForm: { type: Object as PropType<LoginData>, required: true },
  copyrightYear: { type: [Number, String], required: true },
  currentLoginTheme: { type: Object, required: true },
  systemMajorConfig: { type: Object as PropType<Record<string, any>>, required: true },
  loginLabel: { type: String, required: true },
  accountLoginLabel: { type: String, required: true },
  accountPlaceholder: { type: String, required: true },
  passwordPlaceholder: { type: String, required: true },
  enableI18n: { type: Boolean },
  languages: { type: Array as PropType<RuntimeLanguage[]>, required: true },
  currentLanguage: { type: Object as PropType<RuntimeLanguage>, required: true },
  onLanguageChange: { type: Function as PropType<(language: RuntimeLanguage) => void>, required: true },
  node_code: String
});

const videoRef = ref<HTMLVideoElement>();

onActivated(() => {
  nextTick(() => {
    if (videoRef.value) {
      videoRef.value.play();
    }
  });
});

/**
 *  有大背景图，并且左侧布局
 */
const useCenteredKeepLeft = {
  justifyContent: 'flex-start',
  paddingLeft: '14%'
};

/**
 *  有大背景图，并且右侧布局
 */
const useCenteredKeepRight = {
  justifyContent: 'flex-end',
  paddingRight: '14%'
};

/**
 * logo的样式
 */
const logoStyle = computed(() => {
  return loginThemeConfig.value.logoPosition === OioLoginLogoPosition.LEFT ? { left: '60px' } : { right: '60px' };
});

/**
 * 背景图
 */
const backgroundImage = computed(() => {
  return loginThemeConfig.value.backgroundImage;
});

/**
 * logo
 */
const loginPageLogo = computed(() => loginThemeConfig.value.logo || '');

/**
 *  当前背景图是不是视频
 */
const isVideoBackground = computed(() => {
  if (backgroundImage.value) {
    const isVideo = !!VIDEO_SUFFIX_LIST.find((suffix) => backgroundImage.value.endsWith(suffix));

    return isVideo;
  }

  return false;
});

/**
 * 默认背景图样式
 */
const useCenteredStyle = computed(() => {
  return {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: isVideoBackground.value ? '' : `url(${backgroundImage.value})`
  };
});

/**
 * 登录页的样式
 */
const loginContainerStyle = computed(() => {
  const { name, backgroundColor } = loginThemeConfig.value;
  let style = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor
  };

  switch (name) {
    case 'CENTER_STICK':
    case 'CENTER_STICK_LOGO':
      style = Object.assign(style, useCenteredStyle.value);
      break;
    case 'LEFT_STICK':
      style = Object.assign(style, useCenteredStyle.value, useCenteredKeepLeft);
      break;
    case 'RIGHT_STICK':
      style = Object.assign(style, useCenteredStyle.value, useCenteredKeepRight);
      break;
    case 'STAND_RIGHT':
      style = Object.assign(style, {
        flexDirection: 'row-Reverse'
      });
      break;
    default:
      break;
  }

  return style;
});

/**
 * logo 是否显示在页面左侧
 */
const logoInLeft = computed(() => {
  return (
    loginThemeConfig.value.logoPosition !== OioLoginLogoPosition.CENTER &&
    loginThemeConfig.value.name !== OioLoginThemeName.CENTER_STICK_LOGO
  );
});

const isStandLayout = computed(() => {
  return [OioLoginThemeName.STAND_LEFT, OioLoginThemeName.STAND_RIGHT].includes(loginThemeConfig.value.name);
});

/**
 * 登录form表单的样式
 */
const loginBlockStyle = computed(() => {
  const style: Record<string, string> = {};
  const { name } = loginThemeConfig.value;
  if ([OioLoginThemeName.STAND_LEFT, OioLoginThemeName.STAND_RIGHT].includes(name)) {
    style.boxShadow = 'none';
    style.margin = '0 150px';
  }

  return style;
});

/**
 * 登录主题配置
 */
const loginThemeConfig = computed<Required<OioLoginThemeConfig>>(() => {
  const name = props.currentLoginTheme.name || OioLoginThemeName.STAND_RIGHT;
  const defaultImage = [OioLoginThemeName.STAND_LEFT, OioLoginThemeName.STAND_RIGHT].includes(name)
    ? genStaticPath('login_bg_left.jpg')
    : genStaticPath('login_big_image@2x-1.png');

  return {
    name,
    backgroundImage: props.currentLoginTheme.backgroundImage || defaultImage,
    backgroundColor: props.currentLoginTheme.backgroundColor!,
    logo: props.currentLoginTheme.logo,
    logoPosition: props.currentLoginTheme.logoPosition || OioLoginLogoPosition.LEFT
  };
});

const copyrightStatus = getCopyrightStatus();

const copyright = computed(() => {
  return {
    year: props.copyrightYear || '',
    company: props.systemMajorConfig?.partnerName || '',
    icp: props.systemMajorConfig?.icpDesc || ''
  };
});

const onCompanyUrl = () => {
  if (props.systemMajorConfig.officialWebsite) {
    window.open(props.systemMajorConfig.officialWebsite, '_blank');
  }
};
</script>

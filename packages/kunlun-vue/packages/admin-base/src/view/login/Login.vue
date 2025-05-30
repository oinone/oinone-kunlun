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
      <div class="login-page-title">{{ translateValueByKey(loginModeTitle) }}</div>
      <div v-if="register" class="register">
        <span class="register-prefix">{{ translateValueByKey('没有账号') }}?</span>
        <span @click="handleRegister">{{ translateValueByKey(registerLabel) }}</span>
      </div>
      <oio-form v-if="isAccount" :data="authForm" class="login-page-form">
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
        <oio-form-item
          v-if="graphCode"
          name="picCode"
          :help="error['picCode']"
          :validateStatus="error['picCode'] ? 'error' : ''"
        >
          <a-input
            class="login-input"
            :placeholder="translateValueByKey('请输入图形验证码')"
            v-model:value="authForm.picCode"
            @change="clearErrorMessage"
          >
            <template #prefix>
              <lock-outlined />
            </template>
            <template #suffix>
              <img :src="graphCode" alt="" @click="getPicCode" />
            </template>
          </a-input>
        </oio-form-item>
      </oio-form>

      <!-- 验证码登录 -->
      <oio-form v-else-if="isCode" class="login-page-form">
        <oio-form-item
          name="phone"
          :help="error['phone']"
          :validateStatus="error['phone'] || error['verificationCode'] ? 'error' : ''"
        >
          <a-input-group compact>
            <a-select
              class="oio-select"
              dropdown-class-name="oio-select-dropdown login-oio-select-dropdown"
              :value="selectCountry"
              show-search
              :filter-option="searchMethod"
              @change="handleCountryChange"
            >
              <a-select-option
                v-for="(country, index) in countryList"
                :key="index"
                :title="country.phoneCode"
                :value="country.phoneCode"
              >
                {{ country.phoneCode }}
              </a-select-option>
            </a-select>
            <oio-input
              class="login-input no-margin phone-input"
              :placeholder="translateValueByKey(phonePlaceholder)"
              v-model:value="authForm.phone"
              @change="clearErrorMessage"
            />
          </a-input-group>
        </oio-form-item>
        <oio-form-item
          name="verificationCode"
          :help="error['verificationCode']"
          :validateStatus="error['phone'] || error['verificationCode'] ? 'error' : ''"
        >
          <a-input-group compact>
            <oio-input
              class="login-input no-margin"
              :placeholder="translateValueByKey(codePlaceholder)"
              v-model:value="authForm.verificationCode"
              @change="clearErrorMessage"
            >
              <template #suffix>
                <oio-button type="link" @click="getCode" :disabled="!canClick">{{ buttonContent }}</oio-button>
              </template>
            </oio-input>
          </a-input-group>
        </oio-form-item>
        <oio-form-item
          v-if="graphCode"
          name="picCode"
          :help="error['picCode']"
          :validateStatus="error['picCode'] ? 'error' : ''"
        >
          <a-input
            class="login-input"
            :placeholder="translateValueByKey('请输入图形验证码')"
            v-model:value="authForm.picCode"
            @change="clearErrorMessage"
          >
            <template #prefix>
              <lock-outlined />
            </template>
            <template #suffix>
              <img :src="graphCode" alt="" @click="getPicCode" />
            </template>
          </a-input>
        </oio-form-item>
      </oio-form>

      <!-- 邮箱登录 -->
      <oio-form v-else-if="isEmail" class="login-page-form">
        <oio-form-item
          name="email"
          :help="error['email']"
          :validateStatus="error['email'] || error['emailCode'] ? 'error' : ''"
        >
          <oio-input
            class="login-input"
            :placeholder="translateValueByKey(emailPlaceholder)"
            v-model:value="authForm.email"
            @change="clearErrorMessage"
          >
          </oio-input>
        </oio-form-item>
        <oio-form-item
          name="emailCode"
          :help="error['emailCode']"
          :validateStatus="error['email'] || error['emailCode'] ? 'error' : ''"
        >
          <a-input-group compact>
            <oio-input
              class="login-input no-margin"
              :placeholder="translateValueByKey(emailCodePlaceholder)"
              v-model:value="authForm.emailCode"
              @change="clearErrorMessage"
            >
              <template #suffix>
                <oio-button type="link" @click="getCode" :disabled="!canClick">{{ buttonContent }}</oio-button>
              </template>
            </oio-input>
          </a-input-group>
        </oio-form-item>
        <oio-form-item
          v-if="graphCode"
          name="picCode"
          :help="error['picCode']"
          :validateStatus="error['picCode'] ? 'error' : ''"
        >
          <a-input
            class="login-input"
            :placeholder="translateValueByKey('请输入图形验证码')"
            v-model:value="authForm.picCode"
            @change="clearErrorMessage"
          >
            <template #prefix>
              <lock-outlined />
            </template>
            <template #suffix>
              <img :src="graphCode" alt="" @click="getPicCode" />
            </template>
          </a-input>
        </oio-form-item>
      </oio-form>

      <div class="login-text-feature">
        <!-- 自动登录占位 -->
        <div></div>
        <div v-if="forgetPassword" class="forget" @click="gotoForget">
          {{ translateValueByKey(forgetPasswordLabel) }}
        </div>
      </div>
      <oio-button type="primary" block @click="login">{{ translateValueByKey(loginLabel) }}</oio-button>
      <div class="login-switch-divider" v-if="codeLogin || email">
        <div class="login-switch-divider__line"></div>
        <div class="login-switch-divider__text">{{ translateValueByKey('其他登录方式') }}</div>
        <div class="login-switch-divider__line"></div>
      </div>
      <div class="login-switch-button__group">
        <div
          v-if="!isAccount"
          class="login-switch-button"
          @click="
            () => {
              setLoginMode(LoginMode.ACCOUNT);
            }
          "
        >
          <oio-icon icon="oinone-a-zhanghaodenglu4x" size="14" color="var(--oio-text-color)" />
          <span>{{ translateValueByKey(accountLoginLabel) }}</span>
        </div>
        <div
          v-if="!isCode && codeLogin"
          class="login-switch-button"
          @click="
            () => {
              setLoginMode(LoginMode.CODE);
            }
          "
        >
          <oio-icon icon="oinone-a-yanzhengmadenglu4x" size="14" color="var(--oio-text-color)" />
          <span>{{ translateValueByKey(codeLoginLabel) }}</span>
        </div>
        <div
          v-if="!isEmail && email"
          class="login-switch-button"
          @click="
            () => {
              setLoginMode(LoginMode.EMAIL);
            }
          "
        >
          <oio-icon icon="oinone-a-youxiangdenglu4x" size="14" color="var(--oio-text-color)" />
          <span>{{ translateValueByKey(emailLoginLabel) }}</span>
        </div>
      </div>
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
import { computed, defineProps, PropType, ref, nextTick, onActivated } from 'vue';
import { Menu as AMenu, MenuItem as AMenuItem, Dropdown as ADropdown } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

import {
  OioLoginThemeName,
  OioLoginLogoPosition,
  getCopyrightStatus,
  OioLoginThemeConfig,
  genStaticPath,
  translateValueByKey
} from '@kunlun/engine';
import { LoginMode, LoginData, RuntimeLanguage } from '@kunlun/vue-ui-common';
import { OioForm, OioButton, OioFormItem, OioInput, OioIcon, VIDEO_SUFFIX_LIST } from '@kunlun/vue-ui-antd';

const props = defineProps({
  login: { type: Function as PropType<() => void>, required: true },
  year: { type: [Number, String], required: true },
  gotoForget: { type: Function as PropType<() => void>, required: true },
  getCode: { type: Function as PropType<() => void>, required: true },
  canClick: { type: Boolean, required: true },
  buttonContent: { type: String, required: true },
  loginBlur: { type: Function as PropType<() => void>, required: false },
  clearErrorMessage: { type: Function as PropType<() => void>, required: true },
  authForm: { type: Object as PropType<LoginData>, required: true },
  countryList: { type: Array as PropType<any[]>, required: true },
  error: { type: Object as PropType<LoginData>, required: true },
  setLoginMode: { type: Function as PropType<(mode: LoginMode) => void>, required: true },
  selectCountry: { type: String, required: true },
  searchMethod: { type: Function as PropType<(keyword: string, option: any) => boolean>, required: true },
  handleCountryChange: { type: Function as PropType<(val: string) => void>, required: true },
  graphCode: { type: String, required: true },
  getPicCode: { type: Function as PropType<() => void>, required: true },
  copyrightYear: { type: [Number, String], required: true },
  currentLoginTheme: { type: Object, required: true },
  systemMajorConfig: { type: Object as PropType<Record<string, any>>, required: true },
  handleRegister: { type: Function as PropType<() => void>, required: true },
  loginLabel: { type: String, required: true },
  forgetPassword: { type: Boolean, required: true },
  forgetPasswordLabel: { type: String, required: true },
  register: { type: Boolean, required: true },
  registerLabel: { type: String, required: true },
  codeLogin: { type: Boolean, required: true },
  accountLoginLabel: { type: String, required: true },
  codeLoginLabel: { type: String, required: true },
  accountPlaceholder: { type: String, required: true },
  passwordPlaceholder: { type: String, required: true },
  phonePlaceholder: { type: String, required: true },
  codePlaceholder: { type: String, required: true },
  email: { type: Boolean, required: true },
  emailLoginLabel: { type: String, required: true },
  emailPlaceholder: { type: String, required: true },
  emailCodePlaceholder: { type: String, required: true },
  loginMode: { type: String as PropType<LoginMode>, required: true },
  isAccount: { type: Boolean, required: true },
  isCode: { type: Boolean, required: true },
  isEmail: { type: Boolean, required: true },
  loginModeTitle: { type: String, required: true },
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

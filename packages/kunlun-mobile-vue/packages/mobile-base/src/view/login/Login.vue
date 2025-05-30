<template>
  <div :class="`${DEFAULT_PREFIX}-login-page`">
    <van-row gutter="24">
      <van-col span="24">
        <div :class="`${DEFAULT_PREFIX}-login-page-form`">
          <div :class="`${DEFAULT_PREFIX}-login-page-form-logo`">
            <img :src="loginPageLogo" alt="logo" />
          </div>
        </div>
      </van-col>
      <van-col span="24">
        <div class="login-page-tabs">
          <div class="login-page-tab" :class="{ active: isAccount }" @click="setLoginMode(LoginMode.ACCOUNT)">
            {{ accountLoginLabel }}
          </div>
          <div
            class="login-page-tab"
            :class="{ active: isCode }"
            @click="setLoginMode(LoginMode.CODE)"
            v-if="codeLogin"
          >
            {{ codeLoginLabel }}
          </div>
        </div>
        <van-form>
          <van-cell-group inset v-if="isAccount">
            <van-field
              v-model="authForm.login"
              clearable
              name="login"
              :error-message="error['login']"
              :placeholder="translateValueByKey(accountPlaceholder)"
              @update:model-value="clearErrorMessage"
            >
              <template #left-icon>
                <user-outlined />
              </template>
            </van-field>
            <van-field
              name="password"
              :error-message="error['password']"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="translateValueByKey(passwordPlaceholder)"
              v-model="authForm.password"
              clearable
              @update:model-value="clearErrorMessage"
              @click-right-icon="showPassword = !showPassword"
            >
              <template #left-icon>
                <lock-outlined />
              </template>
              <template #right-icon>
                <eye-outlined v-if="showPassword" />
                <eye-invisible-outlined v-else />
              </template>
            </van-field>
            <van-field
              v-if="graphCode"
              :placeholder="translateValueByKey('请输入图形验证码')"
              v-model="authForm.picCode"
              clearable
              name="picCode"
              :error-message="error['picCode']"
              @update:model-value="clearErrorMessage"
            >
              <template #left-icon>
                <lock-outlined />
              </template>
              <template #extra>
                <img :src="graphCode" alt="" @click="getPicCode" />
              </template>
            </van-field>
          </van-cell-group>
          <van-cell-group inset v-else-if="isCode">
            <van-field
              name="phone"
              :placeholder="translateValueByKey(phonePlaceholder)"
              v-model="authForm.phone"
              clearable
              class="mobile-phone-input"
              :error-message="error['phone']"
              @update:model-value="clearErrorMessage"
            >
              <template #left-icon>
                <oio-picker
                  :title="translateValueByKey('选择国家/地区')"
                  :value="selectCountry"
                  :options="countryOptions"
                  @change="handleCountryChange"
                >
                  <template #reference
                    >{{ currentCountryName }} {{ selectCountry }} <i class="iconfont oinone-menu-caidanxiala"
                  /></template>
                </oio-picker>
              </template>
            </van-field>
            <van-field
              name="verificationCode"
              :error-message="error['verificationCode']"
              :placeholder="translateValueByKey(codePlaceholder)"
              v-model="authForm.verificationCode"
              clearable
              @update:model-value="clearErrorMessage"
            >
              <template #left-icon>
                <mail-outlined />
              </template>
              <template #extra>
                <oio-button type="link" class="send-verify-code-btn" @click="getCode" :disabled="!canClick">{{
                  buttonContent
                }}</oio-button>
              </template>
            </van-field>
            <van-field
              v-if="graphCode"
              name="picCode"
              :error-message="error['picCode']"
              :placeholder="translateValueByKey('请输入图形验证码')"
              v-model="authForm.picCode"
              clearable
              @update:model-value="clearErrorMessage"
            >
              <template #left-icon>
                <lock-outlined />
              </template>
              <template #extra>
                <img :src="graphCode" alt="" @click="getPicCode" />
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </van-col>
      <van-col span="24" :class="`${DEFAULT_PREFIX}-login-page-btn-box`">
        <!--        <div v-if="forgetPassword" class="forget" @click="gotoForget">{{forgetPasswordLabel}}</div>-->
        <oio-button type="primary" class="login-btn" block @click="login">{{
          translateValueByKey(loginLabel)
        }}</oio-button>
      </van-col>
      <van-col span="24" :class="`${DEFAULT_PREFIX}-login-page-footer`" v-if="copyrightStatus">
        <div>
          Copyrights ©{{ copyright.year }}
          <span @click="onCompanyUrl">{{ translateValueByKey(copyright.company) }}</span>
        </div>
        <div>{{ copyright.icp }}</div>
      </van-col>
    </van-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps, PropType, ref } from 'vue';
import { UserOutlined, LockOutlined, MailOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue';
import { RuntimeLanguage } from '@kunlun/vue-ui-common';
import { OioButton, OioPicker, DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';
import { Row as VanRow, Col as VanCol, Form as VanForm, Field as VanField, CellGroup as VanCellGroup } from 'vant';

import {
  genStaticPath,
  getCopyrightStatus,
  OioLoginLogoPosition,
  OioLoginThemeConfig,
  OioLoginThemeName,
  translateValueByKey
} from '@kunlun/engine';

import { LoginMode, LoginData } from './types';

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
  languages: { type: Array as PropType<RuntimeLanguage[]>, required: true },
  currentLanguage: { type: Object as PropType<RuntimeLanguage>, required: true },
  onLanguageChange: { type: Function as PropType<(language: RuntimeLanguage) => void>, required: true }
});

const showPassword = ref(false);

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

const loginPageLogo = computed(() => loginThemeConfig.value.logo || props.systemMajorConfig?.loginPageLogo);

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

const currentCountryName = computed(() => {
  const find = props.countryList?.find((a) => a.phoneCode == props.selectCountry);
  return find?.name || '';
});

const countryOptions = computed(() => {
  return (props.countryList || []).map((a) => ({ label: `${a.name} ${a.phoneCode}`, value: a.phoneCode }));
});
</script>

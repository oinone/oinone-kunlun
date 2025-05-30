<template>
  <div class="login-page-setting system-setting-page-view">
    <div class="login-page-setting-left">
      <!-- 页面布局 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('页面布局') }}</div>
        </div>
        <div class="flex-s-c wrap page-layout">
          <div
            class="page-layout-item"
            v-for="item in layoutConfigs"
            :key="item.name"
            :class="[layout === item.name && 'active']"
            @click="onChangeLayout(item.name)"
          >
            <img :src="item.url" alt="" />
            <check-circle-filled v-if="layout === item.name" />
          </div>
        </div>
      </div>

      <!-- 页面背景 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('页面背景') }}</div>
        </div>
        <div class="upload-background-image">
          <!-- 上传背景组件 -->
          <upload
            v-if="!background.url"
            limit-file-extensions=".jpg,.png,.mp4,.mov,.avi"
            limitSize="50"
            :multiple="false"
            :value="background"
            :change="onChangeBackground"
            @remove="onRemoveBackground"
            :progress="backgroundProgress"
          >
            <a-spin :spinning="backgroundImagePercent > 0" :indicator="indicator">
              <span class="ant-upload-picture-card-wrapper oio-upload">
                <div class="ant-upload-list ant-upload-list-picture-card">
                  <div class="ant-upload ant-upload-select ant-upload-select-picture-card">
                    <span tabindex="0" class="ant-upload" role="button">
                      <div>
                        <div class="form-upload-img-icon-area">
                          <plus-outlined />
                        </div>
                        <div class="ant-upload-text">{{ translateValueByKey('点击上传') }}</div>
                      </div>
                    </span>
                  </div>
                </div>
              </span>
            </a-spin>
          </upload>

          <!-- 预览背景组件 -->
          <media v-else :use-preview="true" :value="backgroundPreviewValue" @delete="onRemoveBackground"></media>

          <div class="tips">
            {{ selectedLayout.tips }}
          </div>
        </div>

        <!-- 登录页logo -->
        <div class="login-logo">
          <div class="title">{{ translateValueByKey('登录页logo') }}</div>
          <upload-img
            limitSize="5"
            limit-file-extensions=".jpg,.png"
            :multiple="false"
            :value="loginLogo"
            @change="onChangeLoginLogo"
            @remove="onRemoveLoginLogo"
          >
          </upload-img>
          <div class="tips">{{ translateValueByKey('请上传jpg、png格式的图片，文件大小不超过5MB') }}</div>
        </div>
      </div>

      <div class="flex-s-c margin-top" style="margin-top: var(--oio-margin)">
        <oio-button class="margin-right" @click="onBack">{{ translateValueByKey('返回') }}</oio-button>
        <oio-button type="primary" @click="onSaveLoginConfig">{{ translateValueByKey('发布') }}</oio-button>
      </div>
    </div>

    <!-- 效果预览 -->
    <div class="login-page-setting-right flex-1">
      <div class="oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('效果预览') }}</div>
        </div>
      </div>
      <div class="login-page-setting-right-main">
        <div class="host-main">
          <img style="height: 498.65px; width: 600px" :src="hostImage" alt="" ref="hostRef" />
          <div class="login-component" ref="loginPageRef" :class="[isFullScreen && 'login-component-fullscreen']">
            <div class="login-component-block">
              <login-component
                :is-account="true"
                :authForm="{}"
                :countryList="[]"
                :error="{}"
                :systemMajorConfig="{}"
                :currentLoginTheme="currentLoginTheme"
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
import { ref, computed, defineProps, watchEffect, h } from 'vue';
import { genStaticPath, OioLoginThemeName, translateValueByKey } from '@kunlun/engine';
import { OioIcon, OioButton } from '@kunlun/vue-ui-antd';
import { CheckCircleFilled, PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';

import { useFullscreen } from '../../util';

import LoginComponent from '../login/Login.vue';
import Upload from '../../components/upload/Upload.vue';
import UploadImg from '../../components/upload/UploadImg.vue';
import Media from '../../field/form/string/media/Media.vue';

const props = defineProps<{ loginConfig: Record<string, any>; onSaveLoginConfig: () => void; goBack: () => void }>();

const hostImage = genStaticPath('computer-samples.png?x-oss-process=image/resize,m_lfit,h_800');

const loginPageRef = ref<HTMLElement>('' as any);

const background = ref<Record<string, any>>({});
const loginLogo = ref<Record<string, any>>({});
const layout = ref(OioLoginThemeName.STAND_RIGHT);
const hostRef = ref();
const backgroundImagePercent = ref(-1);

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px'
  },
  spin: true
});

/**
 * 数据回填
 */
watchEffect(() => {
  const { loginLayoutType, loginBackground, loginPageLogo } = props.loginConfig;
  if (loginLayoutType) {
    layout.value = loginLayoutType;
  }

  if (loginBackground) {
    background.value.url = loginBackground;
    background.value.uid = `${Date.now()}`;
  }

  if (loginPageLogo) {
    loginLogo.value.url = loginPageLogo;
    loginLogo.value.uid = `${Date.now()}`;
  }
});

const backgroundPreviewValue = computed(() => {
  if (background.value.url) {
    return [background.value.url];
  }

  return [];
});

// 全屏
const { isFullScreen, trigger } = useFullscreen(loginPageRef);

const layoutConfigs = [
  {
    url: genStaticPath('右侧登录@2x.png?x-oss-process=image/resize,m_lfit,h_800'),
    name: OioLoginThemeName.STAND_RIGHT,
    tips: translateValueByKey(
      '请上传jpg、png格式的图片或mp4、mov、avi格式视频。尺寸建议为1200*1080px，文件大小不超过50MB'
    )
  },
  {
    url: genStaticPath('左侧登录@2x.png?x-,oss-process=image/resize,m_lfit,h_800'),
    name: OioLoginThemeName.STAND_LEFT,
    tips: translateValueByKey(
      '请上传jpg、png格式的图片或mp4、mov、avi格式视频。尺寸建议为1200*1080px，文件大小不超过50MB'
    )
  },
  {
    url: genStaticPath('大背景左侧登录@2x.png?x-oss-process=image/resize,m_lfit,h_800'),
    name: OioLoginThemeName.LEFT_STICK,
    tips: translateValueByKey(
      '请上传jpg、png格式的图片或mp4、mov、avi格式视频。尺寸建议为1200*1080px，文件大小不超过50MB'
    )
  },
  {
    url: genStaticPath('大背景居中登录@2x.png?x-oss-process=image/resize,m_lfit,h_800'),
    name: OioLoginThemeName.CENTER_STICK,
    tips: translateValueByKey(
      '请上传jpg、png格式的图片或mp4、mov、avi格式视频。尺寸建议为1920*1080px，文件大小不超过50MB'
    )
  },
  {
    url: genStaticPath('大背景右侧登录@2x.png?x-oss-process=image/resize,m_lfit,h_800'),
    name: OioLoginThemeName.RIGHT_STICK,
    tips: translateValueByKey(
      '请上传jpg、png格式的图片或mp4、mov、avi格式视频。尺寸建议为1920*1080px，文件大小不超过50MB'
    )
  },

  {
    url: genStaticPath('logo在输入框上方@2x.png?x-oss-process=image/resize,m_lfit,h_800'),
    name: OioLoginThemeName.CENTER_STICK_LOGO,
    tips: translateValueByKey(
      '请上传jpg、png格式的图片或mp4、mov、avi格式视频。尺寸建议为1920*1080px，文件大小不超过50MB'
    )
  }
];

const selectedLayout = computed(() => {
  return layoutConfigs.find((v) => v.name === layout.value) || ({} as any);
});

/**
 * 当前登录页主题配置
 */
const currentLoginTheme = computed(() => {
  return {
    name: layout.value,
    logo: loginLogo.value.url || genStaticPath('LOGO图@2x.png'),
    backgroundImage: background.value.url
  } as any;
});

const backgroundProgress = {
  format: (percent) => {
    backgroundImagePercent.value = percent;
  }
};

const onBack = () => {
  props.goBack();
};

const onChangeBackground = (v) => {
  backgroundImagePercent.value = -1;

  const value = Array.isArray(v) ? v[0] || null : {};
  background.value = value;
  props.loginConfig.loginBackground = value.url;
};

const onRemoveBackground = () => {
  background.value = {};
  props.loginConfig.loginBackground = '';
};

const onChangeLoginLogo = (v) => {
  const value = Array.isArray(v) ? v[0] || null : {};
  loginLogo.value = value;
  props.loginConfig.loginPageLogo = value.url;
};

const onRemoveLoginLogo = () => {
  loginLogo.value = {};
  props.loginConfig.loginPageLogo = '';
};

const onChangeLayout = (name) => {
  layout.value = name;
  props.loginConfig.loginLayoutType = name;
};

const onFullPage = () => {
  trigger();
};
</script>
<style lang="scss">
.login-page-setting {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  &-left {
    width: 900px;
    margin-right: 116px;

    .upload-background-image {
      .ant-upload-list-item-list-type-text {
        display: none;
      }
    }
  }

  .form-media-widget-internal .media-video-play i {
    display: none;
  }

  .login-logo {
    margin-top: var(--oio-margin);
  }

  .page-layout {
    gap: var(--oio-margin);
    width: 100%;

    &-item {
      border: 1px solid var(--oio-border-color);
      border-radius: 4px;
      width: calc(33.333333% - var(--oio-margin) * 2 / 3);
      min-height: 114px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &.active {
        border-color: var(--oio-primary-color);
      }

      .anticon-check-circle {
        position: absolute;
        right: 7px;
        bottom: 7px;
        color: var(--oio-primary-color);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        min-height: 114px;
      }
    }
  }

  &-right {
    .login-page-setting-right-main {
      display: inline-block;
      text-align: center;

      .host-main {
        position: relative;
      }

      .login-component {
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

        .login-page {
          transform-origin: 0 0;
          transform: scale(0.33333333333);
          position: absolute;
          left: 0;
          right: 0;
          width: calc(560px * 3);
          height: calc(318px * 3);
        }

        &-fullscreen {
          .login-page {
            transform-origin: 0 0;
            transform: scale(1);
            width: 100vw;
            height: 100vh;
          }
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

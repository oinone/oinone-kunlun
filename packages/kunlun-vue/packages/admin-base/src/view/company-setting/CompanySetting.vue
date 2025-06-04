<template>
  <div class="system-setting-page-view company-setting-view">
    <div class="company-setting-view-container">
      <!-- 企业信息 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('企业信息') }}</div>
        </div>

        <oio-form>
          <oio-form-item :label="translateValueByKey('企业名称')">
            <oio-input v-model:value="companySetting.partnerName"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('企业官网')">
            <oio-input v-model:value="companySetting.officialWebsite"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('企业slogan')">
            <oio-input v-model:value="companySetting.slogan"></oio-input>
          </oio-form-item>
        </oio-form>
      </div>

      <!-- LOGO -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('LOGO设置') }}</div>
        </div>
        <!-- 业务应用导航栏logo -->
        <div>
          <div class="title">{{ translateValueByKey('业务应用导航栏logo') }}</div>
          <div class="flex-s-c">
            <div class="margin-right">
              <div class="flex-row-start-center">
                <div>3:1</div>
                <oio-tooltip-help content="用于左侧菜单栏展开时的logo显示。" />
              </div>
              <upload-img
                limitSize="5"
                limit-file-extensions=".jpg,.png"
                :multiple="false"
                :value="logoInfo"
                @change="onChangeLogo"
                @remove="onRemoveLogo"
              >
              </upload-img>
            </div>

            <div>
              <div class="flex-row-start-center">
                <div>1:1</div>
                <oio-tooltip-help content="用于左侧菜单栏收起时的logo显示。" />
              </div>
              <upload-img
                limitSize="5"
                limit-file-extensions=".jpg,.png"
                :multiple="false"
                :value="appSideLogoInfo"
                @change="onChangeAppSideLogo"
                @remove="onRemoveAppSideLogo"
              >
              </upload-img>
            </div>
          </div>
          <div class="tips">
            {{ translateValueByKey('请上传jpg、png格式的图片，文件大小不超过5MB') }}
          </div>
        </div>

        <!-- 浏览器logo -->
        <div class="margin-top">
          <div class="title">{{ translateValueByKey('浏览器logo') }}</div>
          <upload-img
            limitSize="5"
            limit-file-extensions=".jpg,.png"
            :multiple="false"
            :value="faviconInfo"
            @change="onChangeFavicon"
            @remove="onRemoveFavicon"
          >
          </upload-img>
          <div class="tips">
            {{ translateValueByKey('请上传jpg、png格式的图片，文件大小不超过5MB') }}
          </div>
        </div>

        <div class="flex-s-c margin-top" style="margin-top: var(--oio-margin)">
          <oio-button class="margin-right" @click="onBack">{{ translateValueByKey('返回') }}</oio-button>
          <oio-button type="primary" @click="onSaveCompanySetting">{{ translateValueByKey('发布') }}</oio-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioButton, OioForm, OioFormItem, OioInput, OioTooltipHelp } from '@oinone/kunlun-vue-ui-antd';
import { defineProps, ref, watchEffect } from 'vue';
import UploadImg from '../../components/upload/UploadImg.vue';

const props =
  defineProps<{ companySetting: Record<string, any>; onSaveCompanySetting: () => void; goBack: () => void }>();

// app finder logo
const appSideLogoInfo = ref<Record<string, any>>({});

// app finder 小logo
const logoInfo = ref<Record<string, any>>({});

// 浏览器logo
const faviconInfo = ref<Record<string, any>>({});

/**
 * 数据回填
 */
watchEffect(() => {
  const { logo, appSideLogo, favicon } = props.companySetting;

  if (logo) {
    logoInfo.value.url = logo;
    logoInfo.value.uid = `${Date.now()}`;
  }

  if (appSideLogo) {
    appSideLogoInfo.value.url = appSideLogo;
    appSideLogoInfo.value.uid = `${Date.now()}`;
  }

  if (favicon) {
    faviconInfo.value.url = favicon;
    faviconInfo.value.uid = `${Date.now()}`;
  }
});

const onBack = () => {
  props.goBack();
};

const onChangeAppSideLogo = (v) => {
  const value = Array.isArray(v) ? v[0] || null : {};
  appSideLogoInfo.value = value;
  props.companySetting.appSideLogo = value.url;
};
const onRemoveAppSideLogo = () => {
  appSideLogoInfo.value = {};
  props.companySetting.appSideLogo = '';
};

const onChangeLogo = (v) => {
  const value = Array.isArray(v) ? v[0] || null : {};
  logoInfo.value = value;
  props.companySetting.logo = value.url;
};
const onRemoveLogo = () => {
  logoInfo.value = {};
  props.companySetting.logo = '';
};

const onChangeFavicon = (v) => {
  const value = Array.isArray(v) ? v[0] || null : {};
  faviconInfo.value = value;
  props.companySetting.favicon = value.url;
};
const onRemoveFavicon = () => {
  faviconInfo.value = {};
  props.companySetting.favicon = '';
};
</script>
<style lang="scss">
.company-setting-view {
  .company-setting-view-container {
    width: 600px;

    .ant-form-item-label {
      width: 90px;
      text-align: right;

      & > label {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        display: block;
      }
    }

    .oio-default-group {
      .flex-row-start-center {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>

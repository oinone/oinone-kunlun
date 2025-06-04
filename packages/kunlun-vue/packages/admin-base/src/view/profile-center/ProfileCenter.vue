<template>
  <div class="system-setting-page-view profile-center-view">
    <div class="profile-center-view-container">
      <!-- 个人设置 -->
      <div class="oio-group oio-default-group">
        <div class="oio-group-title-wrapper">
          <div class="oio-group-title">{{ translateValueByKey('个人设置') }}</div>
        </div>

        <oio-form>
          <oio-form-item :label="translateValueByKey('头像')">
            <upload-img
              :multiple="false"
              :value="avatarUrlInfo"
              @change="onChangeAvatarInfo"
              @remove="onRemoveAvatarInfo"
            >
            </upload-img>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('姓名')">
            <oio-input v-model:value="pamirsUser.realname"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('名称')" required>
            <oio-input v-model:value="pamirsUser.name"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('昵称')">
            <oio-input v-model:value="pamirsUser.nickname"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('联系电话')">
            <oio-input v-model:value="pamirsUser.contactPhone"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('联系邮箱')">
            <oio-input v-model:value="pamirsUser.contactEmail"></oio-input>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('性别')">
            <a-select class="oio-select" v-model:value="pamirsUser.gender">
              <a-select-option value="MALE">{{ translateValueByKey('男') }}</a-select-option>
              <a-select-option value="FEMALE">{{ translateValueByKey('女') }}</a-select-option>
              <a-select-option value="NULL">{{ translateValueByKey('未知') }}</a-select-option>
            </a-select>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('生日')">
            <oio-date-picker v-model:value="pamirsUser.birthday" :disabled-date="disabledDate"></oio-date-picker>
          </oio-form-item>
          <oio-form-item :label="translateValueByKey('身份证号码')">
            <oio-input v-model:value="pamirsUser.idCard">s</oio-input>
          </oio-form-item>
        </oio-form>

        <div class="flex-s-c margin-top" style="margin-top: var(--oio-margin)">
          <oio-button class="margin-right" @click="onBack">{{ translateValueByKey('返回') }}</oio-button>
          <oio-button type="primary" @click="onSaveUser">{{ translateValueByKey('保存') }}</oio-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, watchEffect } from 'vue';
import moment, { Moment } from 'moment';
import { OioForm, OioFormItem, OioInput, OioButton, OioDatePicker } from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import UploadImg from '../../components/upload/UploadImg.vue';

const props = defineProps<{ pamirsUser: Record<string, any>; onSaveUser: () => void; goBack: () => void }>();

const avatarUrlInfo = ref<Record<string, any>>({});

watchEffect(() => {
  if (props.pamirsUser.avatarUrl && !avatarUrlInfo.value.url) {
    avatarUrlInfo.value.url = props.pamirsUser.avatarUrl;
    avatarUrlInfo.value.uid = `${Date.now()}`;
  }
});

const disabledDate = (current: Moment) => {
  return current && current > moment().endOf('day');
};

const onBack = () => {
  props.goBack();
};

const onChangeAvatarInfo = (v) => {
  const value = Array.isArray(v) ? v[0] || null : {};
  avatarUrlInfo.value = value;

  // eslint-disable-next-line vue/no-mutating-props
  props.pamirsUser.avatarUrl = value.url;
};

const onRemoveAvatarInfo = () => {
  avatarUrlInfo.value = {};

  // eslint-disable-next-line vue/no-mutating-props
  props.pamirsUser.avatarUrl = '';
};
</script>
<style lang="scss">
.profile-center-view {
  .profile-center-view-container {
    width: 400px;
    .ant-form-item-label {
      width: 80px;
      text-align: right;
    }
  }
}
</style>

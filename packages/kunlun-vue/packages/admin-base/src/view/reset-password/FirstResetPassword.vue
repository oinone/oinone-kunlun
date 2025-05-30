<template>
  <reset-password-layout class="first-reset-password" :logo="logo" :copyright="copyright">
    <div class="form-container">
      <div class="form-title">{{ $translate('首次登录，需要重置密码') }}</div>
      <oio-form
        ref="formRef"
        name="first-reset-password"
        :data="data"
        :rules="verificationRules"
        v-bind="formLayout"
        @finish="onOk"
      >
        <oio-form-item name="newPassword" :label="$translate('设置新密码')">
          <oio-input-password
            :placeholder="$translate('请输入您的密码')"
            v-model:value="data.newPassword"
            autocomplete="new-password"
          />
        </oio-form-item>
        <oio-form-item name="confirmPassword" :label="$translate('确认新密码')">
          <oio-input-password
            :placeholder="$translate('请再次输入您的密码')"
            v-model:value="data.confirmPassword"
            autocomplete="new-password"
          />
        </oio-form-item>
        <oio-form-item v-bind="formButtonLayout">
          <oio-button type="primary" html-type="submit" :loading="loading" block>{{
              $translate('确定')
          }}</oio-button>
        </oio-form-item>
      </oio-form>
    </div>
  </reset-password-layout>
</template>
<script lang="ts">
import { MajorConfig, translateValueByKey } from '@kunlun/engine';

import { FormItemRule, OioButton, OioForm, OioFormInstance, OioFormItem, OioInputPassword } from '@kunlun/vue-ui-antd';
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import ResetPasswordLayout from './layout/ResetPasswordLayout.vue';
import { ResetPasswordData } from './typing';
import { useResetPassword } from './useResetPassword';

export default defineComponent({
  name: 'ForgetPassword',
  components: {
    OioButton,
    OioForm,
    OioFormItem,
    OioInputPassword,
    ResetPasswordLayout
  },
  inheritAttrs: false,
  props: {
    setFormInstance: {
      type: Function as PropType<(instance: OioFormInstance | undefined) => void>
    },
    formData: {
      type: Object as PropType<ResetPasswordData>,
      required: true
    },
    verificationRules: {
      type: Object as PropType<Record<string, FormItemRule[]>>
    },
    majorConfig: {
      type: Object as PropType<MajorConfig>
    },
    copyrightYear: {
      type: String
    },
    onOk: {
      type: Function
    }
  },
  setup(props) {
    const formRef = ref<OioFormInstance>();

    const data = reactive<ResetPasswordData>(props.formData || {});

    const { formLayout, formButtonLayout, loading, logo, copyright, onOk } = useResetPassword(props);

    onMounted(() => {
      props.setFormInstance?.(formRef.value);
    });

    return {
      formRef,
      formLayout,
      formButtonLayout,
      data,
      loading,
      logo,
      copyright,

      onOk,
      translateValueByKey
    };
  }
});
</script>

<template>
  <reset-password-layout class="forget-password" :logo="logo" :copyright="copyright" :key="node_code">
    <div class="form-container">
      <div class="form-title">{{ $translate('重置密码') }}</div>
      <oio-form
        ref="formRef"
        name="forget-password"
        :data="data"
        :rules="verificationRules"
        v-bind="formLayout"
        @finish="onOk"
      >
        <oio-form-item name="phone" :label="$translate('手机号码')">
          <oio-input-group>
            <a-form-item-rest>
              <a-select
                class="oio-select"
                style="flex: 110px 0 0"
                dropdown-class-name="oio-select-dropdown forget-pwd-oio-select-dropdown"
                :value="selectedCountry"
                :options="countryList"
                label-in-value
                show-search
                :filter-option="countryListFilterOption"
                @update:value="onUpdateSelectedCountry"
              />
            </a-form-item-rest>
            <oio-input style="flex: 1" :placeholder="$translate('请输入您的手机号')" v-model:value="data.phone" />
          </oio-input-group>
        </oio-form-item>
        <!--        <oio-form-item name="picCode" label="图形验证码">-->
        <!--          <oio-input placeholder="请输入图形验证码" v-model:value="data.picCode">-->
        <!--            <template #suffix>-->
        <!--              <img :src="data.picCodeImage" alt @click="refreshPicCodeImage" />-->
        <!--            </template>-->
        <!--          </oio-input>-->
        <!--        </oio-form-item>-->
        <oio-form-item name="verificationCode" :label="$translate('短信验证码')">
          <oio-input-group>
            <oio-input
              style="flex: 1"
              :placeholder="$translate('您收到的短信验证码')"
              v-model:value="data.verificationCode"
            />
            <oio-button
              style="flex: 140px 0 0"
              type="primary"
              async
              @click="verificationCodeBtn.onClick"
              :disabled="verificationCodeBtn.disabled"
              >{{ verificationCodeBtn.content }}
            </oio-button>
          </oio-input-group>
        </oio-form-item>
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
          <oio-button type="primary" html-type="submit" :loading="loading" block>{{ $translate('确定') }}</oio-button>
          <div
            style="color: var(--oio-primary-color); text-align: center; margin-top: var(--oio-margin); cursor: pointer"
            @click="gotoLogin"
          >
            {{ $translate('返回登录') }}
          </div>
        </oio-form-item>
      </oio-form>
    </div>
  </reset-password-layout>
</template>
<script lang="ts">
import { MajorConfig, translateValueByKey } from '@oinone/kunlun-engine';
import {
  OioButton,
  OioForm,
  OioFormInstance,
  OioFormItem,
  OioInput,
  OioInputGroup,
  OioInputPassword,
  OioMessage,
  SelectItem
} from '@oinone/kunlun-vue-ui-antd';
import { FormItemRest as AFormItemRest, Select as ASelect } from 'ant-design-vue';
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue';
import { ResourceCountry } from '../../typing';
import ResetPasswordLayout from './layout/ResetPasswordLayout.vue';
import { ResetPasswordData } from './typing';
import { useResetPassword } from './useResetPassword';

interface VerificationCodeBtnState {
  content: string;
  disabled: boolean;
  onClick: (event: PointerEvent) => Promise<void>;
}

export default defineComponent({
  name: 'ForgetPassword',
  components: {
    OioButton,
    OioForm,
    OioFormItem,
    OioInput,
    OioInputGroup,
    OioInputPassword,
    AFormItemRest,
    ASelect,
    ResetPasswordLayout
  },
  inheritAttrs: false,
  props: {
    node_code: String,
    setFormInstance: {
      type: Function as PropType<(instance: OioFormInstance | undefined) => void>
    },
    gotoLogin: {
      type: Function
    },
    formData: {
      type: Object as PropType<ResetPasswordData>,
      required: true
    },
    verificationRules: {
      type: Object
    },
    majorConfig: {
      type: Object as PropType<MajorConfig>
    },
    copyrightYear: {
      type: String
    },
    countryList: {
      type: Array as PropType<SelectItem<ResourceCountry>[]>
    },
    selectedCountry: {
      type: Object as PropType<SelectItem<ResourceCountry>>
    },
    onSelectCountry: {
      type: Function as PropType<(selected: SelectItem<ResourceCountry>) => void>
    },
    fetchVerificationCode: {
      type: Function as PropType<(e: PointerEvent) => Promise<boolean>>
    },
    refreshPicCodeImage: {
      type: Function
    },
    onOk: {
      type: Function
    }
  },
  setup(props) {
    const FETCH_VERIFICATION_CODE_BTN_CONTENT = {
      default: translateValueByKey('获取验证码'),
      resend: translateValueByKey('重新发送'),
      countdown: translateValueByKey('秒后重新发送')
    };
    const formRef = ref<OioFormInstance>();

    const data = reactive<ResetPasswordData>(props.formData || {});

    const { formLayout, formButtonLayout, loading, logo, copyright, onOk } = useResetPassword(props);

    const verificationCodeBtn = reactive<VerificationCodeBtnState>({
      content: translateValueByKey('获取验证码'),
      disabled: false,
      onClick: async (event: PointerEvent): Promise<void> => {
        if (!(await formRef.value?.validate(['phone', 'picCode']))) {
          return;
        }
        if (props.fetchVerificationCode) {
          let isSuccess: boolean;
          try {
            isSuccess = await props.fetchVerificationCode(event);
          } catch (e) {
            console.error(e);
            isSuccess = false;
            OioMessage.error(translateValueByKey('获取验证码失败'));
          }
          if (isSuccess) {
            verificationCodeBtnCountdown();
          }
        } else {
          OioMessage.error(translateValueByKey('无法获取验证码'));
        }
      }
    });

    const countryListFilterOption = (keyword: string, option: SelectItem<ResourceCountry>) => {
      return option.label.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
    };

    const onUpdateSelectedCountry = ({ option }: { option: SelectItem<ResourceCountry> }) => {
      props.onSelectCountry?.(option);
    };

    const verificationCodeBtnCountdown = () => {
      verificationCodeBtn.disabled = true;
      let countdown = 60;
      const setContent = () => {
        verificationCodeBtn.content = `${countdown}${FETCH_VERIFICATION_CODE_BTN_CONTENT.countdown}`;
      };
      setContent();
      const clock = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(clock);
          verificationCodeBtn.content = FETCH_VERIFICATION_CODE_BTN_CONTENT.resend;
          verificationCodeBtn.disabled = false;
        } else {
          setContent();
        }
      }, 1000);
    };

    onMounted(() => {
      props.setFormInstance?.(formRef.value);
    });

    return {
      formRef,
      formLayout,
      formButtonLayout,
      data,
      loading,
      verificationCodeBtn,
      logo,
      copyright,

      countryListFilterOption,

      onUpdateSelectedCountry,
      onOk,
      translateValueByKey
    };
  }
});
</script>

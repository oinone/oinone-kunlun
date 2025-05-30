<template>
  <div class="form-string-input" :title="realValueByTranslate">
    <oio-input
      :type="realType.toLowerCase()"
      :disabled="disabled"
      :readonly="readonly && !disabled"
      :allowClear="allowClear && !readonly && !disabled"
      :minlength="realMinLength ? realMinLength : 0"
      :placeholder="placeholder"
      :value="realValueByTranslate"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    >
      <template v-if="prefixes && prefixes.length" #prepend>
        <oio-select
          style="width: 90px"
          @change="prefixesChange"
          :options="prefixes"
          :value="prefixesRealValue"
          :allow-clear="true"
        />
      </template>
      <template #prefix v-if="prefix">
        <input-pre-suffix :content-type="prefixType" :content="prefix" />
      </template>
      <template #suffix>
        <div class="suffix-show-count" v-if="showCount">
          {{ (realValue ? realValue.length : 0) + '/' + realMaxLength }}
        </div>
        <div class="suffix-eye" v-if="type === pwdType">
          <oio-icon
            color="var(--oio-icon-color)"
            size="var(--oio-font-size)"
            :icon="invisibleIcon"
            @click="pwdShowClick"
            v-if="eyeStatus(pwdType)"
            onselectstart="return false"
          />
          <oio-icon
            color="var(--oio-icon-color)"
            size="var(--oio-font-size)"
            :icon="visibleIcon"
            @click="pwdHideClick"
            v-if="eyeStatus(textType)"
            onselectstart="return false"
          />
        </div>
        <input-pre-suffix v-if="suffix" :content-type="suffixType" :content="suffix" />
      </template>
    </oio-input>
  </div>
</template>
<script lang="ts">
import { BooleanHelper } from '@kunlun/shared';
import { OioIcon, OioInput, OioSelect, SelectItem } from '@kunlun/vue-ui-antd';
import { InputType } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';
import { isNil, toNumber } from 'lodash-es';
import { computed, defineComponent, ref, watch } from 'vue';
import { InputStringCommonProps } from '../../prop';
import InputPreSuffix from '../common/InputPreSuffix.vue';
import { usePlaceholderProps } from '../../../basic';

/**
 * 文本与密码不区分ttype, 使用同一个组件, 除了密文模糊处理, 所有功能属性保持一致
 */
export default defineComponent({
  name: 'DefaultString',
  inheritAttrs: false,
  props: {
    ...InputStringCommonProps
  },
  components: {
    OioInput,
    InputPreSuffix,
    OioIcon,
    OioSelect
  },
  setup(props, context) {
    /** 默认值不能作为赋值使用
     *  新增时: defaultValue做为默认值发起construct, 由后端返回
     *  编辑时: 必填的值可能返回的是空，这时，默认值不能显示在输入框中，与必填是相反的
     */
    const realValue = ref<string | null | undefined>(props.value);

    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

    const realValueByTranslate = computed(() => {
      if (props.translation) {
        return translateValueByKey(realValue.value);
      }
      return realValue.value;
    });

    const computeRealLength = (length) => {
      let finalLength = toNumber(length);
      if (props.showSuffix && props.suffixStore) {
        finalLength -= props.suffix?.length || 0;
      }
      if (props.showPrefix && props.prefixStore) {
        finalLength -= props.prefix?.length || 0;
      }
      return finalLength > 0 ? finalLength : 0;
    };

    const realMaxLength = computed(() => {
      return computeRealLength(props.maxLength);
    });

    const realMinLength = computed(() => {
      return computeRealLength(props.minLength);
    });

    const prefixesRealValue = ref(
      isNil(props.prefixesValue)
        ? props.prefixes && props.prefixes.length
          ? props.prefixes[0]
          : undefined
        : props.prefixesValue
    );

    const prefixesChange = (val: SelectItem) => {
      props.changePrefixesValue && props.changePrefixesValue(val ? val.key : undefined);
    };

    const realType = ref(props.type);
    const pwdType = ref(InputType.PASSWORD);
    const textType = ref(InputType.TEXT);
    const pwdHideClick = (val) => {
      realType.value = InputType.PASSWORD;
    };
    const pwdShowClick = (val) => {
      realType.value = InputType.TEXT;
    };

    const eyeStatus = (currentType) => {
      return realType.value === currentType && !readonly.value && !disabled.value;
    };

    watch(
      () => props.type,
      (newVal) => {
        realType.value = newVal;
      },
      { immediate: true }
    );

    watch(
      () => props.value,
      (val) => {
        if (isNil(val)) {
          realValue.value = val;
        } else {
          // fixme 此处永远字符末尾不会与后缀相等
          if (props.removePrefixSuffix) {
            realValue.value = props.removePrefixSuffix(val);
          } else {
            realValue.value = val;
          }
        }
      },
      { immediate: props.independentlyEditable } // fixme 这个immediate不能随便加, 先这样兼容行内编辑情况
    );

    watch(
      () => props.defaultValue,
      (val) => {
        if (isNil(val)) {
          realValue.value = undefined;
        } else {
          /** 默认值不能作为赋值使用
           *  新增时: defaultValue做为默认值发起construct, 由后端返回
           *  编辑时: 必填的值可能返回的是空，这时，默认值不能显示在输入框中，与必填是相反的
           */
          // realValue.value = val;
        }
      }
    );

    watch(
      () => realValue.value,
      (val) => {
        if (props.changeInputRealValue) {
          props.changeInputRealValue(val);
        }
      },
      { immediate: true }
    );

    watch(
      () => props.prefixesValue,
      (newVal) => {
        if (isNil(newVal)) {
          prefixesRealValue.value = undefined;
        } else {
          prefixesRealValue.value = newVal;
        }
      }
    );

    watch(
      () => props.prefixes,
      (newVal) => {
        if (newVal && newVal.length) {
          prefixesRealValue.value = newVal[0];
          props.changePrefixesValue && props.changePrefixesValue(prefixesRealValue.value);
        } else {
          prefixesRealValue.value = undefined;
        }
      },
      { immediate: true }
    );
    const { placeholder } = usePlaceholderProps(props);
    return {
      placeholder,
      realValue,
      realValueByTranslate,
      readonly,
      disabled,
      realType,
      realMinLength,
      realMaxLength,
      pwdType,
      textType,
      prefixesChange,
      prefixesRealValue,
      pwdHideClick,
      pwdShowClick,
      eyeStatus
    };
  }
});
</script>

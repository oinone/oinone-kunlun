<template>
  <div class="mobile-form-string-input" :title="realValue">
    <oio-input
      :type="realType.toLowerCase()"
      :inputmode="inputmode"
      :disabled="disabled"
      :readonly="readonly && !disabled"
      :allowClear="allowClear && !readonly && !disabled"
      :minlength="realMinLength ? realMinLength : 0"
      :placeholder="readonly || disabled ? '' : placeholder"
      :value="realValue"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    >
      <template v-if="prefixes && prefixes.length" #prepend>
        <div :class="`${DEFAULT_PREFIX}-input-prefix-select-wrapper`">
          <oio-select
            :class="`${DEFAULT_PREFIX}-input-prefix-select`"
            @change="prefixesChange"
            :options="prefixes"
            :value="prefixesRealValue"
            :allow-clear="true"
          />
          <i :class="`iconfont oinone-menu-caidanxiala ${DEFAULT_PREFIX}-prefix-icon`" />
        </div>
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
            color="var(--oio-text-color)"
            size="var(--oio-font-size)"
            :icon="invisibleIcon"
            @click="pwdShowClick"
            v-if="eyeStatus(pwdType)"
            onselectstart="return false"
          />
          <oio-icon
            color="var(--oio-text-color)"
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
import { BooleanHelper } from '@oinone/kunlun-shared';
import { OioIcon, OioInput, SelectItem, OioSelect, DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { InputType } from '@oinone/kunlun-vue-ui-common';
import { isNil, toNumber } from 'lodash-es';
import { computed, defineComponent, ref, watch } from 'vue';
import { InputStringCommonProps } from '../../prop';
import InputPreSuffix from '../common/InputPreSuffix.vue';

/**
 * 文本与密码不区分ttype, 使用同一个组件, 除了密文模糊处理, 所有功能属性保持一致
 */
export default defineComponent({
  name: 'MobileDefaultString',
  inheritAttrs: false,
  props: {
    ...InputStringCommonProps
  },
  components: {
    OioSelect,
    OioInput,
    InputPreSuffix,
    OioIcon
  },
  setup(props) {
    const realValue = ref<string | null | undefined>(isNil(props.value) ? props.defaultValue : props.value);

    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

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

    function buildPrefixesRealValue(): string | undefined {
      const realVal = realValue.value;
      if (realVal && props.prefixes?.length) {
        const sortedPrefixArray = [...props.prefixes];
        // 字符串长的有限匹配
        sortedPrefixArray.sort((a, b) => (b?.length || 0) - (a?.length || 0));
        return sortedPrefixArray.find((a) => realVal?.startsWith(a));
      }
      return isNil(props.prefixesValue)
        ? props.prefixes && props.prefixes.length
          ? props.prefixes[0]
          : undefined
        : props.prefixesValue;
    }

    const prefixesRealValue = ref(buildPrefixesRealValue());

    if (realValue.value && prefixesRealValue.value) {
      realValue.value = realValue.value.replace(prefixesRealValue.value!, '');
    }

    const prefixesChange = (val: SelectItem<unknown>) => {
      props.changePrefixesValue?.(val ? val.key : undefined);
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
          realValue.value = props.removePrefixSuffix(val);
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
          realValue.value = val;
        }
      }
    );

    watch(
      () => realValue.value,
      (val) => {
        props.changeInputRealValue?.(val);
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
          if (!prefixesRealValue.value) {
            prefixesRealValue.value = newVal[0];
          }
          props.changePrefixesValue?.(prefixesRealValue.value);
        } else {
          prefixesRealValue.value = undefined;
        }
      },
      { immediate: true }
    );

    return {
      realValue,
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
      eyeStatus,
      DEFAULT_PREFIX
    };
  }
});
</script>

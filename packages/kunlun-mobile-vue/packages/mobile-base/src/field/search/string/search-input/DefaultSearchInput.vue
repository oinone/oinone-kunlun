<template>
  <div class="mobile-form-string-input" :title="realValue">
    <oio-input-search
      :type="realType.toLowerCase()"
      :disabled="disabled"
      :readonly="readonly && !disabled"
      :allowClear="allowClear && !readonly && !disabled"
      :minlength="realMinLength ? realMinLength : 0"
      :placeholder="readonly || disabled ? '' : placeholder"
      :value="realValue"
      @update:value="change"
      @search="onSearch"
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
        <input-pre-suffix v-if="prefix" :content-type="prefixType" :content="prefix" />
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
    </oio-input-search>
  </div>
</template>
<script lang="ts">
import { BooleanHelper } from '@oinone/kunlun-shared';
import { OioIcon, OioInputSearch, OioSelect, SelectItem } from '@oinone/kunlun-vue-ui-mobile-vant';
import { InputType } from '@oinone/kunlun-vue-ui-common';
import { isNil, toNumber } from 'lodash-es';
import { computed, defineComponent, ref, watch } from 'vue';
import InputPreSuffix from '../../../form/common/InputPreSuffix.vue';
import { InputStringCommonProps } from '../../../prop';

export default defineComponent({
  name: 'DefaultSearchInput',
  inheritAttrs: false,
  props: {
    ...InputStringCommonProps,
    onSearch: {
      type: Function
    }
  },
  components: {
    OioInputSearch,
    InputPreSuffix,
    OioIcon,
    OioSelect
  },
  setup(props) {
    const realValue = ref(isNil(props.value) ? props.defaultValue : props.value);

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
          realValue.value = undefined;
        } else {
          // fixme 此处永远字符末尾不会与后缀相等
          realValue.value = props.removePrefixSuffix(val);
        }
      }
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
      eyeStatus
    };
  }
});
</script>

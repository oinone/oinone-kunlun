<template>
  <div class="mobile-form-multi-string-tag" :class="[readonly && 'readonly', disabled && 'disabled']" @click="showInputHandle">
    <van-tag
      :title="item"
      :show="true"
      :closeable="!readonly"
      type="primary"
      v-for="(item, index) in tags"
      :key="index"
      @close="delTag(index)"
    >
      <span class="tag-inner">{{ item }}</span>
    </van-tag>
    <input
      v-if="!readonly && !disabled"
      ref="inputRef"
      :class="[
        ...inputClassList,
        tags.length === 0 && 'tags-empty',
        readonly && 'readonly',
        disabled && 'disabled',
        (showInput || tags.length === 0) && 'show-input'
      ]"
      :placeholder="tags.length > 0 || disabled || readonly ? '' : placeholder"
      :maxlength="unitValueLength"
      :value="current"
      @change.stop="currentChange"
      @keyup.enter="addTag"
    />
    <!--    <div v-if="clearStatus" class="clear">-->
    <!--      <i class="van-badge__wrapper van-icon van-icon-clear van-field__clear" @click="clearTag" />-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts">
import { BooleanHelper } from '@kunlun/shared';
import { OioNotification } from '@kunlun/vue-ui-mobile-vant';
import { translateValueByKey } from '@kunlun/engine';
import { Tag as VanTag } from 'vant';
import { computed, defineComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';

export default defineComponent({
  components: {
    VanTag
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: Array,
      default: () => []
    },
    tagChange: {
      type: Function,
      required: false
    },
    blur: {
      type: Function
    },
    placeholder: {
      type: String
    },
    defaultValue: {
      type: Array,
      default: () => []
    },
    unitValueLength: {
      type: Number
    },
    allowClear: {
      type: Boolean
    },
    allowRepeat: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const current = ref('');
    const showInput = ref(false);
    const tags = ref(props.defaultValue || []);
    const readonly = computed(() => BooleanHelper.toBoolean(props.readonly));
    const disabled = computed(() => BooleanHelper.toBoolean(props.disabled));

    const clearStatus = computed(() => {
      return !readonly.value && !disabled.value && tags.value.length > 0 && props.allowClear;
    });

    const currentChange = (val) => {
      current.value = val.target.value;
    };

    const addTag = (e) => {
      const val = current.value;
      if (!val) {
        props.blur?.();
        return;
      }
      if (tags.value.includes(val)) {
        if (!props.allowRepeat) {
          OioNotification.error(translateValueByKey('错误'), translateValueByKey('标签已经存在，不可重复'));
          return;
        }
      }
      tags.value.push(val);
      current.value = '';
      props.tagChange?.(tags.value);
    };

    const delTag = (index) => {
      tags.value.splice(index, 1);
      props.tagChange?.(tags.value);
      hideInput();
    };

    const clearTag = () => {
      tags.value = [];
      props.tagChange?.(tags.value);
      current.value = '';
      hideInput();
    };

    watch(
      () => props.value,
      (newVal) => {
        if (!newVal || !Array.isArray(newVal)) {
          tags.value = [];
        } else {
          tags.value = newVal;
        }
      },
      { immediate: true }
    );

    const inputClassList = [`tag-input`];

    function onBlur(e) {
      addTag(e);
      hideInput();
    }

    function hideInput() {
      showInput.value = false;
      removeEventCheck();
    }

    const inputRef = ref(null as any);

    function showInputHandle(e) {
      if (showInput.value) return;
      showInput.value = true;
      nextTick(() => {
        inputRef.value.focus();
        setTimeout(() => {
          addEventCheck();
        }, 200);
      });
    }

    watch(
      tags,
      () => {
        if (tags.value.length === 0) {
          addEventCheck();
        }
      },
      { immediate: true, deep: true }
    );

    function onContains(e: Event) {
      const target = e.target as HTMLElement;
      if (!target?.className?.includes('van-tag__close') && !inputRef.value?.contains?.(target)) {
        onBlur(e);
      }
    }

    function addEventCheck() {
      document.body.addEventListener('click', onContains);
    }
    function removeEventCheck() {
      document.body.removeEventListener('click', onContains);
    }

    onBeforeUnmount(() => {
      removeEventCheck();
    });

    return {
      inputRef,
      showInput,
      showInputHandle,
      inputClassList,
      current,
      tags,
      readonly,
      disabled,
      clearStatus,
      currentChange,
      onBlur,
      addTag,
      delTag,
      clearTag
    };
  }
});
</script>

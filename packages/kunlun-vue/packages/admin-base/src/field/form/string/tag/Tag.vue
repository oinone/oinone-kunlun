<template>
  <div class="form-multi-string-tag" :class="[readonly && 'readonly', disabled && 'disabled']">
    <a-tag :title="item" :visible="true" :closable="!readonly" v-for="(item, index) in tags" :key="index">
      {{ item }}
      <template #closeIcon>
        <CloseOutlined @click="delTag(index)" />
      </template>
    </a-tag>
    <input
      class="input"
      :class="[tags.length === 0 && 'tags-empty', readonly && 'readonly', disabled && 'disabled']"
      :placeholder="tags.length > 0 ? '' : placeholder"
      :maxlength="unitValueLength"
      :value="current"
      @change.stop="currentChange"
      @keyup.enter="addTag"
      @blur="addTag"
    />
    <div v-if="clearStatus" class="clear">
      <CloseCircleFilled class="anticon anticon-close-circle ant-input-clear-icon" @click="clearTag" />
    </div>
  </div>
</template>
<script lang="ts">
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons-vue';
import { BooleanHelper } from '@kunlun/shared';
import { translateValueByKey } from '@kunlun/engine';
import { OioNotification } from '@kunlun/vue-ui-antd';
import { ViewType } from '@kunlun/meta';
import { Tag as ATag } from 'ant-design-vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { OioCommonProps, OioMetadataProps, usePlaceholderProps } from '../../../../basic';

export default defineComponent({
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: Array
    },
    inputRegular: {
      type: [String, RegExp]
    },
    tagChange: {
      type: Function
    },
    blur: {
      type: Function
    },
    placeholder: {
      type: String
    },
    defaultValue: {
      type: Array
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
    },
    rootViewType: {
      type: String
    }
  },
  components: {
    CloseCircleFilled,
    CloseOutlined,
    ATag
  },
  setup(props) {
    const current = ref('');
    const tags = ref<any>(props.defaultValue || []);
    const readonly = computed(() => {
      if (props.rootViewType === ViewType.Detail) {
        return true;
      }
      return BooleanHelper.toBoolean(props.readonly);
    });
    const disabled = computed(() => {
      if (props.rootViewType === ViewType.Detail) {
        return true;
      }
      return BooleanHelper.toBoolean(props.disabled);
    });

    const clearStatus = computed(() => {
      return !readonly.value && !disabled.value && tags.value.length > 0 && props.allowClear;
    });

    const currentChange = (val) => {
      current.value = val.target.value;
    };

    const addTag = (e) => {
      let val = e.target.value;
      if (!val) {
        props.blur?.();
        return;
      }
      if (props.inputRegular) {
        val = val.replace(props.inputRegular, '');
      }
      if (tags.value.includes(val)) {
        if (!props.allowRepeat) {
          OioNotification.error(translateValueByKey('错误'), translateValueByKey('标签已经存在，不可重复'));
          return;
        }
      }
      if (!val) {
        props.blur?.();
        current.value = '';
        return;
      }
      tags.value.push(val);
      current.value = '';
      props.tagChange?.(tags.value);
    };

    const delTag = (index) => {
      tags.value.splice(index, 1);
      props.tagChange?.(tags.value);
    };

    const clearTag = () => {
      tags.value = [];
      props.tagChange?.(tags.value);
      current.value = '';
    };

    watch(
      () => props.value,
      (newVal) => {
        if (newVal === null) {
          tags.value = [];
        } else {
          tags.value = newVal || [];
        }
      },
      { immediate: true }
    );
    const { placeholder } = usePlaceholderProps(props);
    return {
      placeholder,
      current,
      tags,
      readonly,
      disabled,
      clearStatus,
      currentChange,
      addTag,
      delTag,
      clearTag
    };
  }
});
</script>

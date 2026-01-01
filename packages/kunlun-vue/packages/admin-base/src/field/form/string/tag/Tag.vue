<template>
  <div class="form-multi-string-tag" :class="[readonly && 'readonly', disabled && 'disabled']">
    <a-tag
      :class="{
        'ready-delete-tag': readyDeleteTag && index === tags.length - 1
      }"
      :title="item"
      :closable="!readonly"
      v-for="(item, index) in tags"
      :key="index"
    >
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
      :oninput="onInputValue"
      @keydown="onKeydown"
      @mouseup="onMouseup"
      @blur="onBlur"
    />
    <div v-if="clearStatus" class="clear">
      <CloseCircleFilled class="anticon anticon-close-circle ant-input-clear-icon" @click="clearTag" />
    </div>
  </div>
</template>
<script lang="ts">
import { CloseCircleFilled, CloseOutlined } from '@ant-design/icons-vue';
import { type TableKeyboardConfig, translateValueByKey } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { Tag as ATag } from 'ant-design-vue';
import { computed, defineComponent, type PropType, ref, watch } from 'vue';
import { OioCommonProps, OioMetadataProps, usePlaceholderProps } from '../../../../basic';

export default defineComponent({
  components: {
    CloseCircleFilled,
    CloseOutlined,
    ATag
  },
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
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
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

    const readyDeleteTag = ref(false);

    const clearStatus = computed(() => {
      return !readonly.value && !disabled.value && tags.value.length > 0 && props.allowClear;
    });

    const addTag = (e: KeyboardEvent) => {
      const val = (e.target as HTMLInputElement).value;
      addTag0(val);
      if (val && e.key === props.tableKeyboardConfig?.enter?.key) {
        e.stopPropagation();
      }
    };

    const addTag0 = (val: string) => {
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
      props.tagChange?.(tags.value);
    };

    const delTag = (index) => {
      tags.value.splice(index, 1);
      props.tagChange?.(tags.value);
    };

    const clearTag = () => {
      tags.value = [];
      props.tagChange?.(tags.value);
    };

    const onInputValue = (e: InputEvent) => {
      const input = e.target as HTMLInputElement;
      let val = input.value;
      if (val && props.inputRegular) {
        val = val.replace(props.inputRegular, '');
      }
      input.value = val;
    };

    const onKeydown = (e: KeyboardEvent) => {
      const { key } = e;
      if (key !== 'Backspace') {
        readyDeleteTag.value = false;
      }
      switch (key) {
        case 'Enter':
          addTag(e);
          break;
        case 'Backspace':
          delTagByBackspace(e);
          break;
      }
    };

    const delTagByBackspace = (e: KeyboardEvent) => {
      const val = (e.target as HTMLInputElement).value;
      if (val) {
        return;
      }
      if (tags.value.length >= 1) {
        if (readyDeleteTag.value) {
          delTag(tags.value.length - 1);
          readyDeleteTag.value = false;
        } else {
          readyDeleteTag.value = true;
        }
      }
    };

    const onMouseup = () => {
      readyDeleteTag.value = false;
    };

    const onBlur = (e: Event) => {
      readyDeleteTag.value = false;
      const val = (e.target as HTMLInputElement).value;
      addTag0(val);
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
      readyDeleteTag,
      clearStatus,
      addTag,
      delTag,
      clearTag,

      onInputValue,
      onKeydown,
      onMouseup,
      onBlur
    };
  }
});
</script>

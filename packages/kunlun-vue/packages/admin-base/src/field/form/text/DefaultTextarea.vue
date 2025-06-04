<template>
  <div class="form-text-area">
    <oio-textarea
      ref="formTextArea"
      :value="realValue"
      :default-value="defaultValue"
      :placeholder="placeholder"
      :minlength="minLength"
      :truncateMaxLength="maxLength"
      :auto-size="autoSize"
      :show-count="showCount"
      :disabled="disabled"
      :readonly="readonly && !disabled"
      @update:value="change"
      @focus="focus"
      @blur="blur"
    />
    <div v-if="clearStatus" class="clear">
      <CloseCircleFilled class="anticon anticon-close-circle ant-input-clear-icon" @click.stop="clearContent" />
    </div>
  </div>
</template>
<script lang="ts">
import { CloseCircleFilled } from '@ant-design/icons-vue';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { OioTextarea } from '@oinone/kunlun-vue-ui-antd';
import { isNil } from 'lodash-es';
import { computed, defineComponent, ref, watch } from 'vue';
import { OioMetadataProps, usePlaceholderProps } from '../../../basic';

export default defineComponent({
  name: 'DefaultTextarea',
  components: {
    OioTextarea,
    CloseCircleFilled
  },
  inheritAttrs: false,
  props: {
    ...OioMetadataProps,
    value: {
      type: String
    },
    defaultValue: {
      type: String
    },
    placeholder: {
      type: String
    },
    rows: {
      type: Number,
      default: 3
    },
    allowClear: {
      type: Boolean
    },
    showCount: {
      type: Boolean
    },
    maxLength: {
      type: Number
    },
    minLength: {
      type: Number
    },
    change: {
      type: Function
    },
    focus: {
      type: Function
    },
    blur: {
      type: Function
    }
  },
  setup(props) {
    const formTextArea = ref();

    const readonly = computed(() => BooleanHelper.toBoolean(props.readonly));
    const disabled = computed(() => BooleanHelper.toBoolean(props.disabled));
    const realValue = ref(props.value || props.defaultValue);

    const autoSize = computed(() => {
      const { rows } = props;
      if (isNil(rows)) {
        return true;
      }
      return {
        minRows: rows
      };
    });

    watch(
      () => props.value,
      (val) => {
        if (isNil(val)) {
          realValue.value = undefined;
        } else {
          realValue.value = val;
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

    const clearContent = () => {
      realValue.value = '';
      if (props.change) {
        props.change(realValue);
      }
      formTextArea.value.focus();
    };

    const clearStatus = computed(() => {
      return !props.readonly && !props.disabled && realValue.value && props.allowClear;
    });
    const { placeholder } = usePlaceholderProps(props);
    return {
      placeholder,
      formTextArea,
      readonly,
      disabled,
      realValue,
      autoSize,
      clearContent,
      clearStatus
    };
  }
});
</script>

<template>
  <div class="mobile-form-multi-select" :class="[!allowClear && 'hide-clear']">
    <div :class="readonly && !disabled && 'readonly'">
      <oio-select
        ref="selectRef"
        mode="multiple"
        :title="fieldLabel"
        :placeholder="readonly || disabled ? '' : placeholder"
        :allowClear="allowClear"
        :filter-option="false"
        :options="options"
        :not-found-content="null"
        :default-active-first-option="false"
        :value="realValue"
        :readonly="readonly"
        :disabled="readonly && !disabled ? false : disabled"
        @change="multiSelectChange"
        @blur="blur"
      >
<!--        <van-cell v-for="(item, index) in options" :key="index" :value="item.name">-->
<!--          {{ item.displayName }}-->
<!--        </van-cell>-->
      </oio-select>
    </div>
  </div>
</template>
<script lang="ts">
import { IModelFieldOption } from '@kunlun/meta';
import { defineComponent, PropType, ref } from 'vue';
import { OioSelect } from '@kunlun/vue-ui-mobile-vant';
import { Cell as VanCell } from 'vant';

import {
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext,
  useMetadataProps
} from '../../../../../basic';

export default defineComponent({
  components: { OioSelect, VanCell },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Array] as PropType<string | string[]>
    },
    defaultValue: {
      type: [String, Array] as PropType<string | string[]>
    },
    options: {
      type: Array as PropType<IModelFieldOption[]>,
      default: () => []
    },
    placeholder: {
      type: String
    },
    allowClear: {
      type: Boolean
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props);

    const formContext = useInjectOioDefaultFormContext();

    const selectRef = ref();

    const multiSelectChange = (val) => {
      realValue.value = val.map((a) => a.value);
      props.change?.(realValue.value);
      // selectRef.value.focus();
      props.blur?.();
    };

    return {
      realValue,
      readonly,
      disabled,
      selectRef,
      multiSelectChange,
      getPopupContainer: formContext.getTriggerContainer
    };
  }
});
</script>

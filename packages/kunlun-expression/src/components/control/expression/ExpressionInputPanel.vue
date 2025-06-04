<template>
  <div class="expression-input-panel expression-input-control" :class="className">
    <expression-input-form
      class="expression-input-control-dialog-inner"
      v-model:expression-item-list="expressionItemList"
      :expression-option="expressionOption"
      :filter-method="filterMethod"
      :field-options="fieldOptions"
      :is-simple-mode="isSimpleMode"
      :is-low-code="isLowCode"
      :show-footer="showFooter"
      :change-variable-on-select="changeVariableOnSelect"
      @change-list="handleChangeList"
    />
    <div class="expression-input-panel-footer">
      <oio-button @click="cancelHandler">{{ translateExpValue('取消') }}</oio-button>
      <oio-button type="primary" @click="submitHandler">{{ translateExpValue('确定') }}</oio-button>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { OioButton, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import ExpressionInputForm from './ExpressionInputForm.vue';
import { createDefaultExpressionItem, translateExpValue } from '../../../share';
import { IExpressionItem } from '../../../types';
import { ExpressionCommonProps } from '../typing';
import { useExpressionOptions } from '../use/use-expression';
import { useWatchExpressionItemList } from '../use/use-common';

export default defineComponent({
  inheritAttrs: false,
  components: { ExpressionInputForm, OioButton },
  props: {
    ...ExpressionCommonProps,
    class: {
      type: [String, Array] as PropType<string | string[]>
    },
    onHide: Function
  },
  setup(props, { emit }) {
    const expressionItemList = ref<IExpressionItem[]>([]);
    const { expressionOption } = useExpressionOptions(props, expressionItemList);
    useWatchExpressionItemList(props, expressionOption, expressionItemList);

    const handleChangeList = (newList) => {
      expressionItemList.value = newList || [];
    };

    const cancelHandler = () => {
      expressionItemList.value = [createDefaultExpressionItem(props.type!)];
      props.onHide?.();
    };

    const submitHandler = () => {
      props.onChangeList?.(expressionItemList.value);
      emit('change-expression-items', expressionItemList.value);
    };
    const className = computed(() =>
      StringHelper.append(
        [],
        props.class,
        props.disabled ? 'expression-input-panel-disabled' : '',
        props.readonly ? 'expression-input-panel-readonly' : ''
      )
    );
    return {
      expressionOption,
      expressionItemList,
      handleChangeList,
      cancelHandler,
      submitHandler,
      className,
      translateExpValue
    };
  }
});
</script>

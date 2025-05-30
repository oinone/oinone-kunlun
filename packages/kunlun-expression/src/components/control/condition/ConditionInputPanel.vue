<template>
  <div class="expression-input-control expression-input-panel" :class="className">
    <condition-input-form
      class="expression-input-control-dialog-inner"
      v-model:expression-item-list="expressionItemList"
      :expression-option="expressionOption"
      :mode="expressMode"
      :filter-method="filterMethod"
      :field-options="fieldOptions"
      :is-simple-mode="isSimpleMode"
      :is-field-store="isFieldStore"
      :is-low-code="isLowCode"
      :source-code="sourceCode"
      :show-footer="showFooter"
      :change-variable-on-select="changeVariableOnSelect"
      @update:mode="onChangeExpressMode"
      @change-list="handleChangeList"
      @change-source-code="onChangeSourceCode"
    />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { StringHelper } from '@kunlun/shared';
import ConditionInputForm from './ConditionInputForm.vue';
import { createDefaultExpressionItem } from '../../../share';
import { IExpressionItem } from '../../../types';
import { ConditionCommonProps, ExpressionEvent } from '../typing';
import { useConditionOptions } from '../use/use-condition';
import { useSubmitExpressionHandler, useWatchExpressionItemList } from '../use/use-common';

export default defineComponent({
  inheritAttrs: false,
  components: { ConditionInputForm },
  props: {
    ...ConditionCommonProps,
    class: {
      type: [String, Array] as PropType<string | string[]>
    },
    onHide: Function
  },
  emits: ExpressionEvent,
  setup(props, { emit }) {
    const expressionItemList = ref<IExpressionItem[]>([]);
    const { expressionOption } = useConditionOptions(props, expressionItemList);
    useWatchExpressionItemList(props, expressionOption, expressionItemList);

    const handleChangeList = (newList) => {
      expressionItemList.value = newList || [];
      submitHandler();
    };

    const cancelHandler = () => {
      expressionItemList.value = [createDefaultExpressionItem(props.type!)];
      props.onHide?.();
    };

    const { submitHandler } = useSubmitExpressionHandler(
      props,
      emit,
      ref(false),
      expressionOption,
      ref([]),
      expressionItemList
    );

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
      className
    };
  }
});
</script>

<template>
  <variable-input-form-field
    v-bind="$props"
    ref="variableFormRef"
    :options="availableOptions"
    :pagination="pagination"
    :on-pagination-change="onPaginationChange"
    :fetch-children="fetchChildrenInner"
    :on-keyword-change="onKeywordChange"
    :change="onChange"
    @change="onChange"
    @change-list="onChangeList"
    @change-variable-type="changeVariableType"
    @blur="blurHandle"
  />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import VariableInputFormField from './VariableInputFormField.vue';
import { createComponent, IVariableFormProps } from './variableFormBase';

export default defineComponent({
  components: { VariableInputFormField },
  ...createComponent(),
  props: IVariableFormProps
});
</script>

<template>
  <variable-tag-form-field
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
s
<script lang="ts">
import VariableTagFormField from './VariableTagFormField.vue';
import { defineComponent } from 'vue';
import { createComponent, IVariableFormProps } from './variableFormBase';

export default defineComponent({
  components: { VariableTagFormField },
  ...createComponent(),
  props: IVariableFormProps
});
</script>

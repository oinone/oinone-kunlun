<template>
  <oio-form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
    <oio-form-item :label="translateValueByKey('权限条件')" required>
      <a-select
        class="oio-select"
        dropdown-class-name="oio-select-dropdown"
        :value="exps.connect"
        @change="changeConnect"
      >
        <a-select-option value="and" key="and">{{ translateValueByKey('满足全部') }}</a-select-option>
        <a-select-option value="or" key="or">{{ translateValueByKey('满足任一') }}</a-select-option>
      </a-select>
    </oio-form-item>
    <exp-item
      v-for="(exp, index) in exps.exps"
      :key="index"
      :exp="exp"
      :fields="fields"
      @change-field="changeField(index, $event)"
      @change-opt="changeOpt(index, $event)"
      @change-value="changeValue(index, $event)"
      @delete="deleteExp(index)"
    />
    <oio-form-item label=" ">
      <oio-button type="primary" @click="newExp">{{ translateValueByKey('新增条件') }}</oio-button>
    </oio-form-item>
  </oio-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioButton, OioForm, OioFormItem } from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import Item from './ExpItem.vue';

export default defineComponent({
  components: {
    ExpItem: Item,
    OioButton,
    OioForm,
    OioFormItem,
    ASelect,
    ASelectOption: ASelect.Option
  },
  props: ['exps', 'fields', 'newExp', 'changeField', 'changeOpt', 'changeValue', 'changeConnect', 'deleteExp'],
  inheritAttrs: false,
  setup(props) {
    return {
      fieldChange(exp, newField) {
        exp.left.val = newField;
      },
      translateValueByKey
    };
  }
});
</script>

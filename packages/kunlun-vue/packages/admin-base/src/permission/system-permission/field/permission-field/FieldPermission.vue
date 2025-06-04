<template>
  <div class="field-permission">
    <div class="field-permission-wrapper">
      <div class="field-permission-model-table" v-if="tableModelXml">
        <div class="field-permission-model-table-search">
          <div class="field-permission-model-table-search-input">
            <oio-input
              :placeholder="translateValueByKey('所属应用')"
              allow-clear
              v-model:value="modelSearchData.moduleName"
            />
            <oio-input
              :placeholder="translateValueByKey('模型名称')"
              allow-clear
              v-model:value="modelSearchData.displayName"
            />
            <oio-input
              :placeholder="translateValueByKey('描述')"
              allow-clear
              v-model:value="modelSearchData.description"
            />
          </div>

          <div class="field-permission-model-table-search-button">
            <oio-button type="primary" @click="onTableSearch('model', modelSearchData)">{{
              translateValueByKey('搜索')
            }}</oio-button>
            <oio-button @click="onResetModelSearch">{{ translateValueByKey('重置') }} </oio-button>
          </div>
        </div>
        <slot name="model" />
      </div>
      <div class="field-permission-permission-table" v-if="tableFieldXml">
        <div class="field-permission-model-table-search">
          <div class="field-permission-model-table-search-input">
            <oio-input
              :placeholder="translateValueByKey('字段显示名称')"
              allow-clear
              v-model:value="fieldSearchData.moduleName"
            />
            <oio-input
              :placeholder="translateValueByKey('字段技术名称')"
              allow-clear
              v-model:value="fieldSearchData.displayName"
            />
          </div>

          <div class="field-permission-model-table-search-button">
            <oio-button type="primary" @click="onTableSearch('field', fieldSearchData)">{{
              translateValueByKey('搜索')
            }}</oio-button>
            <oio-button @click="onResetFieldSearch">{{ translateValueByKey('重置') }}</oio-button>
          </div>
        </div>
        <slot name="field" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { OioButton, OioInput } from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    OioButton,
    OioInput
  },
  props: ['onTableSearch', 'tableModelXml', 'tableFieldXml'],
  setup(props) {
    const modelSearchData = ref({
      moduleName: '',
      displayName: '',
      description: ''
    });

    const onResetModelSearch = () => {
      modelSearchData.value = {
        moduleName: '',
        displayName: '',
        description: ''
      };
      props.onTableSearch('model', modelSearchData.value);
    };

    const fieldSearchData = ref({
      displayName: '',
      field: ''
    });

    const onResetFieldSearch = () => {
      fieldSearchData.value = {
        displayName: '',
        field: ''
      };
      props.onTableSearch('field', modelSearchData.value);
    };

    return {
      fieldSearchData,
      onResetFieldSearch,
      modelSearchData,
      translateValueByKey,
      onResetModelSearch
    };
  }
});
</script>
<style lang="scss">
.field-permission {
  .field-permission-model-table-search {
    display: flex;
    margin-bottom: var(--oio-margin);
    &-input,
    &-button {
      display: flex;
      gap: var(--oio-margin);
    }
    &-input {
      flex: 1;
      margin-right: var(--oio-margin);
    }
  }
}
</style>

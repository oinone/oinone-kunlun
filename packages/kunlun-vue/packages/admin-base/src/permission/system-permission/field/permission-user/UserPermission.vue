<template>
  <div class="field-permission">
    <div class="field-permission-wrapper">
      <div class="field-permission-model-table" v-if="tableModelXml">
        <div class="field-permission-model-table-search">
          <div class="field-permission-model-table-search-input">
            <oio-input :placeholder="translateValueByKey('名称')" allow-clear v-model:value="modelSearchData.name" />
            <oio-input
              :placeholder="translateValueByKey('登录账号')"
              allow-clear
              v-model:value="modelSearchData.login"
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
      name: '',
      login: ''
    });

    const onResetModelSearch = () => {
      modelSearchData.value = {
        name: '',
        login: ''
      };
      props.onTableSearch('model', modelSearchData.value);
    };

    return {
      modelSearchData,
      translateValueByKey,
      onResetModelSearch
    };
  }
});
</script>

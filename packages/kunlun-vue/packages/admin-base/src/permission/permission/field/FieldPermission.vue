<template>
  <div class="field-permission">
    <div class="field-permission-header">
      <div class="field-permission-model-table-search">
        <oio-input-search allow-clear @update:value="search" :value="searchText" />
      </div>
      <div class="field-permission-permission-table-operators">
        <template v-if="!disabled">
          <oio-button @click="batchEnable" type="primary" style="margin-right: 4px">{{
            translateValueByKey('批量授权')
          }}</oio-button>
          <oio-button @click="batchDisable">{{ translateValueByKey('批量取消授权') }}</oio-button>
        </template>
      </div>
    </div>
    <div class="field-permission-wrapper">
      <div class="field-permission-model-table">
        <slot name="model" />
      </div>
      <div class="field-permission-permission-table">
        <slot name="field" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { OioButton, OioInputSearch } from '@kunlun/vue-ui-antd';
import { translateValueByKey } from '@kunlun/engine';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    OioButton,
    OioInputSearch
  },
  props: ['batchEnable', 'batchDisable', 'search', 'searchText', 'disabled'],
  setup() {
    return {
      translateValueByKey
    };
  }
});
</script>

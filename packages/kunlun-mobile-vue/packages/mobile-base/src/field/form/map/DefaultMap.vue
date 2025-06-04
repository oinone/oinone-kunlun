<template>
  <div class="mobile-field-map-form">
    <template v-if="viewType === 'DETAIL' || readonly || disabled">
      <div class="map-items" v-if="items && items.length">
        <span class="map-item" v-for="(item, index) in items" :key="index"> {{ item.name }}:{{ item.value }}</span>
      </div>
      <detail-common-field v-else />
    </template>
    <template v-else>
      <oio-button @click="addRecord" type="primary" :disabled="limit && items.length >= limit">{{
        translateValueByKey('添加')
      }}</oio-button>
      <oio-form style="display: flex; flex-wrap: wrap; align-items: center">
        <oio-form-item
          v-for="(item, index) in items"
          :key="index"
          hide-label
          no-border-bottom
          style="width: 100%; margin-bottom: 8px"
        >
          <div style="display: flex; align-items: center">
            <oio-input v-model:value="item.name" @change="onHandleChange">
              <template #suffix>&nbsp;:&nbsp;</template>
            </oio-input>
            <oio-input v-model:value="item.value" @change="onHandleChange" />
            <span
              class="van-icon van-icon-clear van-field__clear"
              style="margin-left: 8px"
              @click="removeRecord(index)"
            ></span>
          </div>
        </oio-form-item>
      </oio-form>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { OioButton, OioForm, OioFormItem, OioInput } from '@oinone/kunlun-vue-ui-mobile-vant';
import { translateValueByKey } from '@oinone/kunlun-engine';
import DetailCommonField from '../../detail/common/DetailCommonField.vue';

export default defineComponent({
  components: {
    OioButton,
    OioForm,
    OioInput,
    OioFormItem,
    DetailCommonField
  },
  inheritAttrs: false,
  props: ['items', 'limit', 'addRecord', 'removeRecord', 'viewType', 'onHandleChange', 'readonly', 'disabled'],
  setup() {
    return {
      translateValueByKey
    };
  }
});
</script>

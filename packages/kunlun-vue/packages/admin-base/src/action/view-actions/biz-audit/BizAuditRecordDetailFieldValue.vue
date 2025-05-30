<template>
  <div class="biz-audit-record-detail-field-value">
    <common-row :item="fieldList[0]" :divider="false" />
    <a-popover overlayClassName="oio-popover" :title="$translate(title)" placement="left" v-if="fieldList.length">
      <template #content>
        <div
          :style="{ width: width }"
          v-for="item in fieldList"
          :key="item.fieldCode"
          class="multi-field-datOioPopover"
        >
          <common-row :item="item" />
        </div>
      </template>
      <a style="margin-left: 4px">{{ translateValueByKey('查看全部') }}</a>
    </a-popover>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OioIcon } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';
import CommonRow from './CommonRow.vue';

export default defineComponent({
  name: 'BizAuditRecordDetailFieldValue',
  components: { CommonRow, OioIcon },
  props: {
    fieldList: {
      type: Array,
      default: () => []
    },
    title: {
      type: String
    },
    width: {
      type: String
    }
  },

  setup(props) {
    return { translateValueByKey };
  }
});
</script>

<style lang="scss">
.biz-audit-record-detail-field-value {
  align-items: center;
  .multi-field-data-popover {
  }
}
</style>

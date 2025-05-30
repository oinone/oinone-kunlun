<template>
  <div class="biz-audit-record-detail-common-row">
    <span class="field-info field-label">{{ item.fieldName + '：' }}</span>
    <span class="field-info field-origin-value">{{ item.originFieldVal }}</span>
    <span class="field-info field-arrow">--></span>
    <span class="field-info field-target-value" :title="item.targetFieldVal">{{ item.targetFieldVal }}</span>
  </div>
  <div v-if="divider" class="biz-audit-record-detail-common-row-divider" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CommonRow',
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    divider: {
      type: Boolean,
      default: true
    }
  }
});
</script>

<style lang="scss">
.biz-audit-record-detail-common-row {
  display: flex;
  overflow: hidden;
  color: var(--oio-text-color);
  .field-info {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    height: 28px;
    margin: 4px;
    background-color: var(--oio-background);
    white-space: nowrap;

    &.field-label {
    }

    &.field-origin-value {
    }

    &.field-target-value {
      color: var(--oio-primary-color);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: block;
      line-height: 28px;
    }

    &.field-arrow {
      background: unset;
      color: var(--oio-primary-color);
    }
  }
}

.biz-audit-record-detail-common-row-divider {
  height: 1px;
  background: var(--oio-border-color);
  margin-bottom: 4px;
}
</style>

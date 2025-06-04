<template>
  <div class="biz-audit-record-detail" v-if="realData.fieldRecordList || realData.oneList || realData.manyList">
    <div class="common-field-list">
      <oio-group v-if="realData.fieldRecordList" :border="false" :title="translateValueByKey('基础信息')">
        <div v-for="item in realData.fieldRecordList" :key="item.fieldCode" class="single-field-data">
          <div class="field-info field-label">{{ item.fieldName }}</div>
          <div class="field-info field-origin-value" :title="item.originFieldVal">{{ item.originFieldVal }}</div>
          <span class="field-info field-arrow">--></span>
          <div class="field-info field-target-value" :title="item.targetFieldVal">{{ item.targetFieldVal }}</div>
        </div>
      </oio-group>
    </div>
    <div class="one-field-list" v-if="realData.oneList && realData.oneList.length">
      <oio-group :border="false" :title="translateValueByKey('关联信息') + '-' + translateValueByKey('单值')">
        <a-table :columns="oneFieldsColumns" :data-source="realData.oneList">
          <template #bodyCell="context">
            <template v-if="context.column.key === 'fieldList'">
              <biz-audit-record-detail-field-value
                :field-list="context.record.fieldList"
                :title="translateValueByKey('关联数据')"
                width="300px"
              />
            </template>
          </template>
        </a-table>
      </oio-group>
    </div>
    <div class="many-field-list" v-if="realData.manyList && realData.manyList.length">
      <oio-group :border="false" :title="translateValueByKey('关联信息') + '-' + translateValueByKey('多值')">
        <a-table :columns="manyFieldsColumns" :data-source="realData.manyList">
          <template #bodyCell="context">
            <template v-if="context.column.key === 'fieldList'">
              <biz-audit-record-detail-field-value
                :field-list="context.record.fieldList"
                :title="translateValueByKey('关联数据')"
                width="300px"
              />
            </template>
          </template>
        </a-table>
      </oio-group>
    </div>
  </div>

  <a-empty v-else></a-empty>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { OioGroup } from '@oinone/kunlun-vue-ui-antd';
import BizAuditRecordDetailFieldValue from './BizAuditRecordDetailFieldValue.vue';

const commonColumns = [
  {
    title: translateValueByKey('字段编码'),
    dataIndex: 'fieldName',
    key: 'fieldName'
  },
  {
    title: translateValueByKey('原值'),
    dataIndex: 'originFieldVal',
    key: 'originFieldVal'
  },
  {
    title: translateValueByKey('最新值'),
    dataIndex: 'targetFieldVal',
    key: 'targetFieldVal'
  }
];
const oneFieldsColumns = [
  {
    title: translateValueByKey('变更内容'),
    dataIndex: 'fieldName',
    key: 'fieldName'
  },
  {
    title: translateValueByKey('变更类型'),
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: translateValueByKey('变更内容'),
    dataIndex: 'fieldList',
    key: 'fieldList',
    ellipsis: true
  }
];
const manyFieldsColumns = [
  {
    title: translateValueByKey('变更内容'),
    dataIndex: 'fieldName',
    key: 'fieldName'
  },
  {
    title: translateValueByKey('变更类型'),
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: translateValueByKey('关联数据ID'),
    dataIndex: 'businessId',
    key: 'businessId'
  },
  {
    title: translateValueByKey('关联数据编码'),
    dataIndex: 'businessCode',
    key: 'businessCode'
  },
  {
    title: translateValueByKey('变更内容'),
    dataIndex: 'fieldList',
    key: 'fieldList',
    ellipsis: true
  }
];
export default defineComponent({
  name: 'BizAuditRecordDetail',
  components: { BizAuditRecordDetailFieldValue, OioIcon, OioGroup },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },

  setup(props) {
    const realData = computed(() => {
      return props.data[0] || props.data || {};
    });
    return {
      commonColumns,
      oneFieldsColumns,
      manyFieldsColumns,
      realData,
      translateValueByKey
    };
  }
});
</script>

<style lang="scss">
.biz-audit-record-detail {
  .common-field-list {
    margin: 8px 0;

    .single-field-data {
      border-radius: 4px;
      background: var(--oio-body-background);
      display: flex;

      .field-info {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        margin: 12px;
        background-color: var(--oio-background);
        padding-top: 3px;
        padding-bottom: 3px;

        &.field-label {
          width: 90px;
        }

        &.field-origin-value {
          width: 180px;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }

        &.field-target-value {
          width: 180px;
          color: var(--oio-primary-color);
          background-color: rgba(var(--oio-primary-color-rgb), 0.1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 0 5px;
          box-sizing: border-box;
          display: block;
          line-height: 28px;
        }

        &.field-arrow {
          white-space: nowrap;
          background: unset;
          color: var(--oio-primary-color);
        }
      }
    }
  }

  .one-field-list {
    margin-bottom: 8px;
  }

  .many-field-list {
    margin-bottom: 8px;
  }

  .oio-group-title {
    opacity: 0.85;
    font-size: 14px;
    color: var(--oio-text-color);
    font-weight: 400;

    &:before {
      content: '';
      border-left: 2px solid var(--oio-primary-color);
      margin-right: 6px;
    }
  }

  .oio-group {
    border-radius: 4px;
    background: var(--oio-body-color);

    .oio-group-content {
      padding: 12px;
    }

    .oio-group-title-wrapper {
      height: 20px;
      padding: 24px 12px 12px 12px;
    }
  }

  .ant-pagination-next .ant-pagination-item-link,
  .ant-pagination-prev .ant-pagination-item-link {
    background: var(--oio-background);
    border-color: var(--oio-border-color);
    color: var(--oio-icon-color);
  }

  .ant-pagination-item {
    background: var(--oio-background);
    border-color: var(--oio-border-color);
    color: var(--oio-text-color);
  }

  .ant-pagination-item a {
    color: var(--oio-text-color);
  }

  .ant-pagination-item-active a {
    color: var(--oio-primary-color);
  }

  .ant-table {
    background: var(--oio-background);
    .ant-table-tbody > tr > td {
      border-color: var(--oio-border-color);
      color: var(--oio-text-color);
    }

    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
      background: var(--oio-background);
    }

    .ant-table-tbody > tr > td {
      border-color: var(--oio-border-color);
    }

    .ant-table-thead > tr > th {
      background: var(--oio-background);
      border-color: var(--oio-border-color);
      color: var(--oio-text-color);
    }

    .ant-table-tbody > tr.ant-table-placeholder:hover > td {
      background: var(--oio-background);
    }

    .ant-empty-description {
      color: var(--oio-text-color);
    }
  }
}
</style>

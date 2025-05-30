<template>
  <div class="biz-audit-record-detail-list">
    <div class="oio-scrollbar content" v-if="dataSource && dataSource.length">
      <div v-for="(item, index) in dataSource" :key="item.id" class="single-record">
        <div class="left-area">
          <div class="avatar">
            <a-image :src="item.operator.avatarUrl || defaultAvatar" />
          </div>
          <div v-if="index < dataSource.length - 1" class="link-line"></div>
        </div>
        <div class="right-area">
          <div class="action-area">
            <div class="action-name">{{ item.operationName }}</div>
            <div class="action-time">{{ item.createDate }}</div>
          </div>
          <div class="user-area">
            <div class="user-name">{{ item.operatorName }}</div>
            <div class="user-location">{{ item.requestPosition }}</div>
          </div>
          <div class="single-record-detail">
            <!--  通过xml创建DetailWidget -->
            <!--            <slot :name="item.id" />-->
            <biz-audit-record-detail :data="item" />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <a-empty>
        <template #description> {{ translateValueByKey('暂无数据') }}</template>
      </a-empty>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { OioIcon } from '@kunlun/vue-ui-common';
import { genStaticPath, translateValueByKey } from '@kunlun/engine';
import BizAuditRecordDetail from './BizAuditRecordDetail.vue';

export default defineComponent({
  name: 'BizAuditRecordDetailList',
  components: { OioIcon, BizAuditRecordDetail },
  props: {
    dataSource: {
      type: Array as PropType<Record<string, any>>,
      default: () => []
    }
  },

  setup(props) {
    const defaultAvatar = genStaticPath('default_avatar.png');
    return { defaultAvatar, translateValueByKey };
  }
});
</script>

<style lang="scss">
.biz-audit-record-detail-list {
  .content {
    height: 100%;

    .single-record {
      display: flex;
      width: 100%;

      .left-area {
        width: 38px;
        display: flex;
        flex-direction: column;
        margin-right: 16px;

        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          height: 38px;
          width: 38px;
          border-radius: 4px;
        }

        .link-line {
          flex: 1;
          display: flex;
          margin: 4px auto;
          width: 3px;
          background: var(--oio-border-color);
          border-radius: 1.5px;
        }
      }

      .right-area {
        width: calc(100% - 38px);

        .action-area {
          display: flex;
          justify-content: space-between;
          letter-spacing: 0;
          font-weight: 400;

          .action-name {
            color: var(--oio-text-color);
          }

          .action-time {
            color: var(--oio-text-color-three);
          }
        }

        .user-area {
          display: flex;
          justify-content: space-between;
          letter-spacing: 0;
          font-weight: 400;
          color: var(--oio-text-color-three);
        }
      }
    }
  }

  .ant-table-thead > tr > th {
    padding: 8px;
  }
}

.biz-data-record-detail-inner-popup {
  min-width: 400px;
}
</style>

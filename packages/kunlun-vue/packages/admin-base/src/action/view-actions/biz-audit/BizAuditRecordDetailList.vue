<template>
  <div class="biz-audit-record-detail-list">
    <div class="biz-audit-record-refresh" @click="handleReFetch">
      <oio-icon icon="oinone-shuaxin" size="16px" />
    </div>
    <oio-spin :loading="loading">
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
        <oio-empty-data />
      </div>
    </oio-spin>
  </div>
</template>

<script lang="ts">
import { genStaticPath } from '@oinone/kunlun-engine';
import { OioEmptyData, OioSpin } from '@oinone/kunlun-vue-ui-antd';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { defineComponent, type PropType, ref } from 'vue';
import BizAuditRecordDetail from './BizAuditRecordDetail.vue';

export default defineComponent({
  name: 'BizAuditRecordDetailList',
  components: {
    OioIcon,
    OioSpin,
    OioEmptyData,
    BizAuditRecordDetail
  },
  props: {
    dataSource: {
      type: Array as PropType<Record<string, any>>,
      default: () => []
    },
    reFetchData: {
      type: Function
    }
  },

  setup(props) {
    const loading = ref(false);
    const defaultAvatar = genStaticPath('default_avatar.png');

    const handleReFetch = async () => {
      loading.value = true;
      try {
        await props.reFetchData?.();
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      defaultAvatar,
      handleReFetch
    };
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

.biz-audit-record-refresh {
  width: 20px;
  height: 20px;
  position: absolute;
  top: 17px;
  right: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>

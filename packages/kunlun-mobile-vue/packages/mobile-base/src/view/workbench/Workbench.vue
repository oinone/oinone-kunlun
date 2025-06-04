<template>
  <div class="mobile-workbench-wrapper">
    <div class="workbench-total">
      <div class="workbench-total-user">
        <div class="workbench-total-user-title">
          Hi，{{ taskInfo.tips }}！{{ translateValueByKey('记得及时处理待办喔~') }}
        </div>
        <div class="workbench-total-user-content">
          <div class="workbench-total-user-header">
            <div class="workbench-total-user-info">
              <div class="workbench-total-user-info-title">
                <oio-icon icon="oinone-wodedaiban" size="24px"></oio-icon>{{ translateValueByKey('我的待办') }}
              </div>
            </div>
            <div class="workbench-total-user-logo">
              <img
                src="https://pamirs.oss-cn-hangzhou.aliyuncs.com/kubernetes/upload/libra/sstest2022/09/02sstest/位图_1662089572724.png?x-oss-process=image/resize,m_lfit,h_800"
              />
            </div>
          </div>
          <div class="workbench-total-user-body">
            <div
              class="workbench-total-user-item"
              v-for="(item, index) in taskInfo.workBenchTaskList"
              :key="index"
              @click="executeAction(item.viewAction, { activeTab: index })"
            >
              <div class="workbench-total-user-item-label">{{ item.label }}</div>
              <div class="workbench-total-user-item-number">
                {{ item.num }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="workbench-total-flow">
        <div
          class="workbench-total-flow-item"
          v-for="(item, index) in taskTotalList"
          :key="index"
          @click="executeAction(item.viewAction)"
        >
          <div class="workbench-total-flow-item-info">
            <div class="workbench-total-flow-item-label">{{ item.label }}</div>
            <div class="workbench-total-flow-item-total">{{ item.num }}</div>
          </div>
          <div class="workbench-total-flow-item-icon">
            <div :style="{ backgroundImage: `url(${iconBg[item.icon]})` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { Toast } from 'vant';
import { OioIcon } from '@oinone/kunlun-vue-ui-mobile-vant';
import { get as getValue } from 'lodash-es';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { useRouter } from '@oinone/kunlun-vue-router';
import { Entity, IViewAction, ViewActionTarget } from '@oinone/kunlun-meta';
import { executeViewAction, RuntimeViewAction, translateValueByKey } from '@oinone/kunlun-engine';
import { getWorkbenchInfo } from './services';
import { getCurrentTenant } from '../../util';

export default defineComponent({
  name: 'WorkbenchView',
  components: { OioIcon },
  setup() {
    const taskInfo = ref<Record<string, unknown>>({});
    const taskTotalList = ref<Record<string, unknown>[]>([]);
    const isLoadData = ref(false);
    let router: Router | null = null;
    let matchedInstance: Matched | null = null;
    const iconBg = {
      'oinone-chaosong':
        'https://pamirs.oss-cn-hangzhou.aliyuncs.com/kubernetes/upload/libra/sstest2022/09/02sstest/抄送_1662089537523.png?x-oss-process=image/resize,m_lfit,h_800',
      'oinone-wofaqide':
        'https://pamirs.oss-cn-hangzhou.aliyuncs.com/kubernetes/upload/libra/sstest2022/09/02sstest/我发起的_1662089552722.png?x-oss-process=image/resize,m_lfit,h_800',
      'oinone-woyibanjie':
        'https://pamirs.oss-cn-hangzhou.aliyuncs.com/kubernetes/upload/libra/sstest2022/09/02sstest/我已办结_1662089589543.png?x-oss-process=image/resize,m_lfit,h_800',
      'oinone-zhanneixin1':
        'https://pamirs.oss-cn-hangzhou.aliyuncs.com/kubernetes/upload/libra/sstest2022/09/02sstest/站内信_1662089604277.png?x-oss-process=image/resize,m_lfit,h_800'
    };

    onMounted(async () => {
      const { matched } = useMatched();
      matchedInstance = matched;
      router = useRouter().router as Router;

      Toast.loading({
        message: '加载中...',
        forbidClick: true
      });
      const res = await getWorkbenchInfo();
      taskInfo.value = res.activeTaskStatistics as Record<string, unknown>;
      taskTotalList.value = getValue(res, 'workStatistics.workBenchTaskList') as Record<string, unknown>[];
      isLoadData.value = true;
      Toast.clear();
    });

    const executeAction = (action: IViewAction, params: Record<string, any> = {}) => {
      const extraParam = params;
      const tenant = getCurrentTenant();
      if (tenant) {
        extraParam.tenant = tenant;
      }
      executeViewAction(
        { ...action, target: ViewActionTarget.OpenWindow } as RuntimeViewAction,
        router,
        matchedInstance,
        extraParam
      );
    };

    return {
      taskInfo,
      taskTotalList,
      iconBg,
      isLoadData,
      executeAction,
      translateValueByKey
    };
  }
});
</script>
<style lang="scss">
.mobile-workbench-wrapper {
  padding: 24px;
  .workbench-total {
    &-user {
      &-content {
        position: relative;
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.05);
        border-radius: var(--oio-border-radius-lg);
        background-color: white;
      }
      &-header {
        display: flex;
        justify-content: flex-start;
        margin: 0 24px;
        padding: var(--oio-margin-lg) 0;
        height: 90px;
      }
      &-title {
        font-size: var(--oio-font-size-lg);
        font-weight: var(--oio-font-weight);
        color: var(--oio-text-color);
        margin: var(--oio-margin-sm) 0 var(--oio-margin-lg) 0;
      }
      &-info {
        &-title {
          font-size: var(--oio-font-size-lg);
          color: var(--oio-text-color);
          font-weight: var(--oio-font-weight);
          display: flex;
          align-items: center;
        }
      }
      &-body {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        padding: 16px 24px;
      }
      &-item {
        text-align: left;
        cursor: pointer;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        overflow: hidden;
        transition: all ease 0.3s;
        &-number {
          font-size: var(--oio-font-size-lg);
          color: var(--oio-primary-color);
          font-weight: var(--oio-font-weight);
          display: flex;
          align-items: center;
          .oio-icon {
            margin-left: var(--oio-margin-sm);
            margin-right: -16px;
            transition: all ease 0.5s;
            opacity: 0;
          }
        }
        &-label {
          font-size: var(--oio-font-size);
          color: var(--oio-text-color-secondary);
          font-weight: var(--oio-font-weight);
        }
        &:hover {
          .oio-icon {
            margin-right: 0px;
            opacity: 1;
          }
        }
      }
      &-logo {
        position: absolute;
        right: 24px;
        top: -50px;
        img {
          width: 206px;
          height: 160px;
        }
      }
    }
    &-flow {
      border-radius: var(--oio-border-radius-lg);
      margin-top: var(--oio-margin-md);
      &-item {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        margin: 0 0 var(--oio-margin-md) 0;
        height: 120px;
        background-color: white;
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        transition: all ease 0.4s;
        position: relative;
        overflow: hidden;
        &-info {
          align-self: center;
          padding: 0 24px;
          text-align: left;
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        &-icon {
          align-self: flex-end;
          position: absolute;
          right: 0;
          div {
            width: 48px;
            height: 46px;
            background-size: contain;
            background-repeat: no-repeat;
          }
        }
        &-total {
          font-size: 28px;
          color: var(--oio-primary-color);
          font-weight: var(--oio-font-weight-thick);
        }
        &-label {
          font-size: var(--oio-font-size);
          color: var(--oio-text-color-secondary);
          font-weight: var(--oio-font-weight-thick);
        }
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}
</style>

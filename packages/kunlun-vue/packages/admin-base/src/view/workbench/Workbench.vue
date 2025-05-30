<template>
  <div class="workbench-wrapper">
    <div class="workbench-total">
      <div class="workbench-total-user">
        <div class="workbench-total-user-title">
          Hi，{{ taskInfo.tips }}！{{ translateValueByKey('记得及时处理待办喔') }}~
        </div>
        <div class="workbench-total-user-content">
          <div class="workbench-total-user-header">
            <div class="workbench-total-user-info">
              <div class="workbench-total-user-info-title">
                <oio-icon icon="oinone-wodedaiban" size="24px"></oio-icon>
                {{ translateValueByKey('我的待办') }}
              </div>
            </div>
            <div class="workbench-total-user-logo">
              <img :src="`${genStaticPath('位图_1662089572724.png')}`" />
            </div>
          </div>
          <div class="workbench-total-user-body">
            <div
              class="workbench-total-user-item"
              v-for="item in taskInfo.workBenchTaskList"
              @click="executeAction(item.viewAction)"
            >
              <div class="workbench-total-user-item-label">{{ item.label }}</div>
              <div class="workbench-total-user-item-number">
                {{ item.num }}
                <oio-icon icon="oinone-jiantou" size="16px" color="#035DFF"></oio-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="workbench-total-flow">
        <div class="workbench-total-flow-item" v-for="item in taskTotalList" @click="executeAction(item.viewAction)">
          <div class="workbench-total-flow-item-info">
            <div class="workbench-total-flow-item-total">{{ item.num }}</div>
            <div class="workbench-total-flow-item-label">{{ item.label }}</div>
          </div>
          <div class="workbench-total-flow-item-icon">
            <oio-icon :icon="iconBg[item.icon]" size="114px"></oio-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="workbench-app">
      <div class="workbench-app-title">
        {{ translateValueByKey('我收藏的应用')
        }}<span class="desc">{{ translateValueByKey('在应用中心点击星标收藏应用') }}</span>
      </div>
      <div class="workbench-app-container" v-if="apps && apps.length">
        <div
          class="workbench-app-container-item"
          v-for="app in apps"
          :key="app.name"
          @click="gotoApplicationHomepage(app)"
        >
          <div class="workbench-app-container-item-logo">
            <img :src="app.logo || genStaticPath('default.png')" alt="" />
          </div>
          <div class="workbench-app-container-item-name">{{ app.displayName }}</div>
        </div>

        <div class="workbench-app-container-item create-app-box" @click="gotoApps">
          <oio-icon icon="oinone-fangda" size="24" color="var(--oio-primary-color)" />
        </div>
      </div>
      <div class="workbench-app-container app-empty" v-else-if="!apps.length && isLoadData">
        <img :src="`${genStaticPath('毛玻璃_1662098933770.png')}`" />
        <div class="desc">{{ translateValueByKey('暂无收藏的应用') }} <br />{{}}</div>
        <oio-button v-if="appsPerm" type="primary" icon="oinone-jiantou" iconPlacement="after" @click="gotoApps"
          >{{ translateValueByKey('去试试') }}
        </oio-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  executeViewAction,
  genStaticPath,
  MultiTabInstance,
  MultiTabsManager,
  RuntimeViewAction,
  translateValueByKey
} from '@kunlun/engine';
import { IURLAction, ViewActionTarget, ViewType } from '@kunlun/meta';
import { Matched, Router, useMatched } from '@kunlun/router';
import { gotoHomepage } from '@kunlun/vue-admin-layout';
import { useRouter } from '@kunlun/vue-router';
import { OioButton, OioIcon } from '@kunlun/vue-ui-antd';
import { get as getValue } from 'lodash-es';
import { defineComponent, onMounted, ref } from 'vue';
import { getApps, getWorkbenchInfo } from './services';

export default defineComponent({
  name: 'WorkbenchView',
  components: { OioIcon, OioButton },
  props: ['genStaticPath'],
  setup(props) {
    const apps = ref<Record<string, unknown>[]>([]);
    const taskInfo = ref<Record<string, unknown>>({});
    const taskTotalList = ref<Record<string, unknown>[]>([]);
    const isLoadData = ref(false);
    const appsPerm = ref(true);
    let router: Router | null = null;
    let matchedInstance: Matched | null = null;
    const iconBg = {
      'oinone-chaosong': 'oinone-chaosong',
      'oinone-wofaqide': 'oinone-wofaqide',
      'oinone-woyibanjie': 'oinone-woyibanjie',
      'oinone-zhanneixin1': 'oinone-zhanneixin1'
    };

    onMounted(async () => {
      const { matched } = useMatched();
      matchedInstance = matched;
      router = useRouter().router as Router;
      const result = await getApps();
      const res = await getWorkbenchInfo();
      appsPerm.value = res.appsPerm as boolean;
      taskInfo.value = res.activeTaskStatistics as Record<string, unknown>;
      taskTotalList.value = getValue(res, 'workStatistics.workBenchTaskList') as Record<string, unknown>[];
      apps.value = result;
      isLoadData.value = true;
    });

    const gotoApplicationHomepage = (app: { module: string; name: string; homePage: RuntimeViewAction; urlHomePage?: IURLAction; }) => {
      gotoHomepage(app.module, app.name, app.urlHomePage);
    };

    const executeAction = (action: RuntimeViewAction) => {
      const extra = action.context ? JSON.stringify(action.context) : '';

      const onRefreshTabWithActive = (manager: MultiTabsManager, instance: MultiTabInstance) => {
        manager.refresh(instance.key);
        manager.clearOnActive(onRefreshTabWithActive);
      };

      MultiTabsManager.INSTANCE.onActive(onRefreshTabWithActive);

      executeViewAction({ ...action, target: ViewActionTarget.OpenWindow }, router, matchedInstance, {
        searchBody: extra
      });
    };

    const gotoApps = () => {
      const action = {
        model: 'apps.AppsManagementModule',
        name: 'homepage',
        resModule: 'apps',
        resModuleName: 'apps',
        resViewType: ViewType.Table
      };
      executeAction(action as RuntimeViewAction);
    };

    return {
      apps,
      appsPerm,
      taskInfo,
      taskTotalList,
      iconBg,
      isLoadData,
      gotoApps,
      gotoApplicationHomepage,
      executeAction,
      translateValueByKey
    };
  }
});
</script>
<style lang="scss">
.workbench-wrapper {
  width: 1200px;
  margin: auto;

  .workbench-total {
    display: flex;
    margin-bottom: var(--oio-margin-lg);

    &-user {
      &-content {
        width: 486px;
        position: relative;
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.05);
        border-radius: var(--oio-border-radius-lg);
        background-color: var(--oio-background);
      }

      &-header {
        display: flex;
        justify-content: flex-start;
        margin: 0 48px;
        padding: var(--oio-margin-lg) 0;
        height: 82px;
      }

      &-title {
        font-size: var(--oio-font-size-lg);
        font-weight: var(--oio-font-weight);
        color: var(--oio-text-color);
        margin: var(--oio-margin-sm) 0 var(--oio-margin-lg) 0;
        position: relative;
        z-index: 2;
      }

      &-info {
        &-title {
          font-size: var(--oio-font-size-lg);
          color: var(--oio-text-color);
          font-weight: var(--oio-font-weight);
          display: flex;
          align-items: center;

          svg {
            margin-right: var(--oio-margin-sm);
            filter: var(--oio-normal-icon-filter);
          }
        }
      }

      &-body {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        padding: 16px 48px;
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
        top: -36px;

        img {
          width: 206px;
          height: 160px;
        }
      }
    }

    &-flow {
      border-radius: var(--oio-border-radius-lg);
      display: flex;
      flex-wrap: wrap;
      margin-top: calc(25px + var(--oio-margin-sm) + var(--oio-margin-lg));

      &-item {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        margin: 0 0 var(--oio-margin-lg) var(--oio-margin-lg);
        width: 333px;
        height: 161px;
        background-color: var(--oio-background);
        box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        transition: all ease 0.4s;
        overflow: hidden;

        &:hover {
          box-shadow: 0 0 20px 0 rgba(3, 93, 255, 0.2);
        }

        &-info {
          align-self: center;
          margin-left: 46px;
          text-align: left;
        }

        &-icon {
          align-self: flex-end;
          position: relative;
          left: 10px;
          top: 10px;

          svg {
            filter: var(--oio-icon-filter);
            opacity: var(--oio-icon-filter-opacity);
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

  .workbench-app {
    &-title {
      font-size: var(--oio-font-size-lg);
      color: var(--oio-text-color);
      font-weight: var(--oio-font-weight);
      margin-bottom: var(--oio-margin-lg);
      display: flex;
      align-items: center;

      .desc {
        margin-left: var(--oio-margin-sm);
        font-size: var(--oio-font-size);
        color: var(--oio-text-color-secondary);
      }
    }

    &-container {
      display: flex;
      flex-wrap: wrap;

      &-item {
        margin-right: 60px;
        margin-bottom: var(--oio-margin-lg);
        text-align: center;
        max-width: 66px;
        cursor: pointer;

        &:nth-child(10n) {
          margin-right: 0;
        }

        &-logo {
          img {
            width: 66px;
            height: 66px;
            border-radius: 10px;
          }

          margin-bottom: var(--oio-margin-xs);
        }

        &-name {
          font-size: var(--oio-font-size);
          color: var(--oio-text-color-secondary);
        }
      }

      .create-app-box {
        width: 66px;
        height: 66px;
        border: dashed 1px rgba(var(--oio-primary-color-rgb), 0.5);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(var(--oio-primary-color-rgb), 0.1);
        transition: all ease 0.3s;

        svg {
          opacity: 0.5;
          transition: all ease 0.3s;
        }

        &:hover {
          border: dashed 1px rgba(var(--oio-primary-color-rgb), 1);

          svg {
            opacity: 1;
          }
        }
      }
    }
  }

  .app-empty {
    padding-top: 24px;
    display: block;
    margin: auto;
    background-color: var(--oio-background);
    text-align: center;
    padding-bottom: 24px;

    img {
      width: 200px;
      height: 169px;
      margin-bottom: 20px;
    }

    .desc {
      font-size: 14px;
      color: var(--oio-text-color);
      text-align: center;
      margin-bottom: 12px;
    }
  }
}
</style>

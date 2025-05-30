<template>
  <div class="paas-install-list-box">
    <div
      class="card-group-box"
      v-for="(group, index) in groups"
      :class="[`card-group-width-${group.middlewareAppForCardList.length}`]"
      :key="index"
    >
      <div class="card-group-title">
        {{ group.categoryDisplayName }}
      </div>
      <div class="card-list-content">
        <div class="card-item-box" v-for="item in group.middlewareAppForCardList" :key="item.appName">
          <div class="card-item-content">
            <div
              class="card-item-img"
              :style="{
                'background-image': `url(${item.icon})`
              }"
            ></div>
            <div class="card-info-box">
              <div class="card-info-item-title">{{ item.appName }}</div>
              <div class="card-item-desc">
                <a-tooltip placement="top" :title="item.appDesc" color="#ffffff" overlayClassName="PaaSTooltipClass">
                  <div class="card-item-desc-text">{{ item.appDesc }}</div>
                </a-tooltip>
              </div>
            </div>
          </div>
          <div class="card-item-footer">
            <oio-button type="primary" @click="executeAction(item, 'redirectCreatePage')">{{
              translateValueByKey('安装')
            }}</oio-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { getModel } from '@kunlun/service';
import { Router, useMatched } from '@kunlun/router';
import { useRouter } from '@kunlun/vue-router';
import { ActionType, IModel, ViewActionTarget } from '@kunlun/meta';
import { executeServerAction, executeViewAction, RedirectTargetEnum, translateValueByKey } from '@kunlun/engine';

import { OioButton } from '@kunlun/vue-ui-antd';
import { getInstallPaaSModules } from './service';
import { DialogViewActionWidget } from '../../action';
import { executeConfirm } from '../../util';

export default defineComponent({
  name: 'PaasManagerView',
  components: { OioButton },
  props: {
    viewModel: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const dataSource = ref<Record<string, unknown>[]>([]);
    const router = ref<Router>(null as any);
    const matchedInstance = ref(null as any);

    const groups = ref<Record<string, unknown>[]>([]);

    const loadData = async () => {
      const { segmentParams = {} } = useMatched().matched;
      const { page = {} } = segmentParams;

      const result = await getInstallPaaSModules(page.actionId);

      dataSource.value = result as Record<string, unknown>[];
      groups.value = [...(result as Record<string, unknown>[])];
    };

    watch(
      () => props.viewModel,
      async () => {
        if (props.viewModel) {
          loadData();
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      const { matched } = useMatched();
      matchedInstance.value = matched;
      router.value = useRouter().router as Router;
    });

    const getActionByModel: any = (model: IModel, actionName: string) => {
      const actions = [
        ...(model.viewActionList || []),
        ...(model.urlActionList || []),
        ...(model.serverActionList || [])
      ];
      return actions.find((action) => action.name === actionName);
    };

    const executeAction = async (item, actionName, actionType, confirm, target: RedirectTargetEnum | undefined) => {
      if (confirm) {
        const res = await executeConfirm(confirm);
        if (!res) {
          return;
        }
      }
      const model = await getModel(props.viewModel);
      const action = getActionByModel(model, actionName);

      if (!action) {
        console.error('action匹配异常');
        return;
      }

      if (action.target === ViewActionTarget.Dialog) {
        const dialog = new DialogViewActionWidget();
        dialog.initialize({
          action,
          viewModel: props.viewModel,
          activeRecords: [item]
        });
        dialog.click();
        return;
      }

      if (action.actionType === ActionType.View) {
        return executeViewAction(action, router.value, matchedInstance.value, { id: item.id }, target);
      }
      if (action.actionType === ActionType.Server) {
        await executeServerAction(action, item);
        loadData();
      } else {
        console.error('跳转异常');
      }
    };

    return { dataSource, groups, executeAction, translateValueByKey };
  }
});
</script>

<style lang="scss">
.paas-install-list-box {
  width: 100%;
  min-width: 1200px;
  display: flex;
  flex-wrap: wrap;

  .card-group-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #000000;
    font-weight: 500;
    line-height: 16px;
  }

  .card-list-content {
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;

    .card-item-box {
      background: #ffffff;
      border: 1px solid #e3e7ee;
      box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin-bottom: 24px;
      padding: 24px 24px 16px 24px;
      overflow: hidden;

      .card-item-content {
        display: flex;
        padding-bottom: 16px;
      }

      .card-item-img {
        width: 68px;
        height: 68px;
        margin-right: 24px;
        background-repeat: no-repeat;
        background-size: contain;
        flex-basis: 68px;
        min-width: 68px;
      }

      .card-info-box {
        border-radius: 4px;
        font-size: 14px;
        width: calc(100% - 92px);
        .card-info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
        }
      }

      .card-info-item-title {
        font-size: 14px;
        color: #333333;
        letter-spacing: 0;
        font-weight: 500;
        margin-bottom: 8px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .card-item-desc {
        display: flex;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
        .card-item-desc-text {
          font-size: 14px;
          color: #666666;
          overflow: hidden;
          text-overflow: ellipsis;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          &:last-child {
            margin-bottom: 0px;
          }
        }
      }

      .card-item-footer {
        display: flex;
        justify-content: flex-end;
        button {
          width: 57px;
          height: 24px;
          background: var(--oio-primary-color);
          box-shadow: 0px 1px 2px 0px rgba(56, 130, 245, 0.2);
          border-radius: 4px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        span {
          font-size: 12px;
        }
      }
    }
  }

  .card-group-width {
    margin-right: 24px;
  }

  .card-group-width-5 {
    width: 100%;
    .card-item-box {
      width: calc((100% - 120px) / 5);
      &:not(:nth-child(5n)) {
        margin-right: 24px;
      }
    }
  }
  .card-group-width-4 {
    width: 80%;
    .card-item-box {
      width: calc((100% - 96px) / 4);
      &:not(:nth-child(4n)) {
        margin-right: 24px;
      }
    }
  }
  .card-group-width-3 {
    width: 60%;
    .card-item-box {
      width: calc((100% - 72px) / 3);
      &:not(:nth-child(3n)) {
        margin-right: 24px;
      }
    }
  }
  .card-group-width-2 {
    width: 40%;
    .card-item-box {
      width: calc((100% - 48px) / 2);
      &:not(:nth-child(2n)) {
        margin-right: 24px;
      }
    }
  }
  .card-group-width-1 {
    width: 20%;
    .card-item-box {
      width: calc(100% - 24px);
      margin-right: 24px;
    }
  }
}
.PaaSTooltipClass {
  max-width: 500px;
  .ant-tooltip-inner {
    color: rgba(0, 0, 0, 0.65);
    font-size: 12px;
    padding: 16px;
  }
}
</style>

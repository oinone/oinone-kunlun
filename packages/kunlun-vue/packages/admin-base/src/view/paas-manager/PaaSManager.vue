<template>
  <div class="paas-cart-list-box">
    <div
      class="card-group-box"
      v-for="group in groups"
      :class="[
        `card-group-width-${group.middlewareConsoleList.length >= 5 ? 'max' : group.middlewareConsoleList.length}`
      ]"
    >
      <div class="card-group-title">{{ group.categoryDisplayName }}</div>
      <div class="card-list-content">
        <div class="card-item-box" v-for="item in group.middlewareConsoleList">
          <div class="card-item-content">
            <div
              class="card-item-img"
              :style="{
                'background-image': `url(${item.icon})`
              }"
            ></div>
            <div class="card-info-box">
              <div class="card-info-item-title">{{ item.displayName }}</div>
              <div class="card-item-desc">
                <div class="card-item-desc-text">
                  ip{{ translateValueByKey('端口') }}: {{ item.ip }}:{{ item.port[0].port }}
                </div>
              </div>
              <div class="card-item-desc">
                <div class="card-item-desc-text">{{ translateValueByKey('当前版本') }}: {{ item.version }}</div>
              </div>
            </div>
          </div>
          <div class="card-item-footer">
            <div class="action-item" @click="executeAction(item, item.viewActionName || '', 'view', '', '_blank')">
              <i class="iconfont oinone-jinrukongzhitai" />
            </div>
            <div class="action-item" @click="executeAction(item, 'setUp', 'view')">
              <i class="iconfont oinone-shezhi" />
            </div>
            <div class="action-item" @click="executeAction(item, 'unInstall', 'view')">
              <i class="iconfont oinone-xiezai" />
            </div>
            <div class="action-item" @click="executeAction(item, 'updateVersion', 'view')">
              <i class="iconfont oinone-shengji" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="dialog" />
  </div>

  <div v-if="!groups.length" class="to-install-pass" @click="onToInstallPage">
    {{ translateValueByKey('没有已安装的控制台，点击这里去安装') }}
  </div>
</template>

<script lang="ts">
import { executeServerAction, executeViewAction, RedirectTargetEnum, RuntimeViewAction } from '@oinone/kunlun-engine';
import { ActionType, IModel, ViewActionTarget } from '@oinone/kunlun-meta';
import { Router, useMatched } from '@oinone/kunlun-router';
import { getModel } from '@oinone/kunlun-service';
import { useRouter } from '@oinone/kunlun-vue-router';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { DialogViewActionWidget } from '../../action';
import { executeConfirm } from '../../util';
import { getPaaSModules } from './service';

export default defineComponent({
  name: 'PaasManagerView',
  props: {
    viewModel: {
      type: String,
      default: ''
    }
  },
  emits: ['gotoEditLogicView'],
  setup(props) {
    const dataSource = ref<Record<string, unknown>[]>([]);
    const router = ref<Router>(null as any);
    const matchedInstance = ref(null as any);

    const groups = ref<Record<string, unknown>[]>([]);

    const loadData = async () => {
      const result = await getPaaSModules();
      dataSource.value = result as Record<string, unknown>[];
      groups.value = [...(result as Record<string, unknown>[])];
    };

    watch(
      () => props.viewModel,
      async () => {
        loadData();
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

    const executeAction = async (item, actionName, actionType, confirm, target?: RedirectTargetEnum | undefined) => {
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
      } else if (action.actionType === ActionType.Server) {
        await executeServerAction(action, item);
        loadData();
      } else {
        console.error('跳转异常');
      }
    };

    const onToInstallPage = async () => {
      const model = await getModel('paas.MiddlewareApp')!;
      const action = model.viewActionList!.find((a) => a.name === 'paas#工具安装台') as unknown as RuntimeViewAction;

      if (action) {
        executeViewAction(action);
      }
    };

    return { dataSource, groups, executeAction, onToInstallPage, translateValueByKey };
  }
});
</script>

<style lang="scss">
.to-install-pass {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  color: var(--oio-primary-color);
  display: flex;
  align-items: center;
}

.paas-cart-list-box {
  width: 100%;
  min-width: 1200px;
  display: flex;
  flex-wrap: wrap;

  .card-group-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #000000;
    font-weight: 500;
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
      margin-bottom: 16px;
      overflow: hidden;

      .card-item-content {
        padding: var(--oio-padding);
        display: flex;
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
        font-size: 12px;
        display: flex;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .card-item-desc-text {
          color: rgba(0, 0, 0, 0.45);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          text-decoration: none;

          &:last-child {
            margin-bottom: 0px;
          }
        }
      }

      .card-item-footer {
        height: 40px;
        background: #fafafa;
        border-top: 1px solid #e3e7ee;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .action-item {
          border-right: solid 1px #e3e7ee;
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 14px;
          cursor: pointer;

          &:last-child {
            border: none;
          }

          i {
            font-size: 14px;
            color: var(--oio-primary-color);
          }
        }
      }
    }
  }

  .card-group-width {
    margin-right: 24px;
  }

  .card-group-width-max {
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
</style>

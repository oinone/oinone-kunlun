<template>
  <div>
    <oio-spin :loading="loading" size="large">
      <slot name="AppsSearch" />
      <div class="gallery-widget-content">
        <div class="gallery-module-category">
          <div class="gallery-module-category-title">
            <i class="iconfont oinone-yingyongfenlei" />
            {{ translateValueByKey('应用分类') }}
          </div>
          <div
            class="gallery-module-category-item"
            :class="[active === -1 && 'active']"
            @click="(active = -1), onChangeCategory()"
          >
            <span> {{ translateValueByKey('全部') }} </span>
            <span>{{ allModuleLength || 0 }}</span>
          </div>
          <div
            class="gallery-module-category-item"
            v-for="(item, index) in moduleCategory"
            :key="index"
            :class="[active === index && 'active']"
            @click="(active = index), onChangeCategory(item.code)"
          >
            <span>{{ item.name }}</span>
            <span>{{ item.moduleNum || 0 }}</span>
          </div>
        </div>
        <div class="gallery-container" :class="[isEmpty && 'gallery-container-empty']">
          <div class="action" v-if="actionPermission.hasCreateAppAction">
            <oio-button type="primary" @click="clickCreateViewAction">{{ translateValueByKey('创建') }}</oio-button>
          </div>
          <div class="cardList" v-if="!isEmpty">
            <div v-for="record in dataSource" :key="record.id" class="cardBox">
              <div class="card">
                <div class="application-content">
                  <div
                    class="application"
                    :style="{
                      'border-left-color': record.application ? 'var(--oio-primary-color)' : '#63A4FF'
                    }"
                  ></div>
                  <div class="application-text">
                    <img style="width: 26px" :src="record.application ? appTag : moduleTag" alt="" />
                  </div>
                </div>
                <img class="logo" :src="record.logo || `${genStaticPath('default.png')}`" />
                <div class="appInfo">
                  <div class="info">
                    <div class="title">
                      <div class="title-module" :title="record.displayName">
                        <div class="module-name">{{ record.displayName }}</div>
                        <div
                          class="collection"
                          v-if="
                            record.application &&
                            record.state === AppState.INSTALLED &&
                            (actionPermission.hasLikeAction || actionPermission.hasUnLikeAction)
                          "
                        >
                          <div>
                            <i
                              v-if="record.like"
                              class="iconfont oinone-shoucang active"
                              @click="onSwitchLike(record)"
                            />
                            <i v-else class="iconfont oinone-weishoucang" @click="onSwitchLike(record)" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="display-name" :title="record.module">{{ record.module }}</div>
                    <div class="state-box">
                      <div v-if="record.state === AppState.INSTALLED" class="state">
                        {{ translateValueByKey('已安装') }}
                      </div>
                      <div v-else-if="!record.state || record.state === AppState.UNINSTALLED" class="install-action">
                        <span class="install-action-font" @click="installApp(record)">{{
                          translateValueByKey('安装')
                        }}</span>
                      </div>
                      <div v-else-if="record.state" class="state">{{ record.stateDisplayName }}</div>
                      <div class="more">
                        <div class="more-icon">
                          <a-popover
                            placement="bottom"
                            destroyTooltipOnHide
                            overlay-class-name="app-gallery-popover-card"
                          >
                            <template #content>
                              <div class="app-gallery-popup-content">
                                <template v-for="(item, index) in moreActions">
                                  <div
                                    :id="'app-gallery-popup-content-item-' + index + record.id"
                                    class="list-action"
                                    :class="{
                                      'has-border-bottom': item.hasBorderBottom
                                    }"
                                    :key="index"
                                    v-if="item.visible(record)"
                                  >
                                    <a-popover
                                      placement="right"
                                      :getPopupContainer="() => moreActionItemNode(index, record.id)"
                                    >
                                      <template #content v-if="item.children">
                                        <div class="list-action-children" style="width: 180px; padding: 6px 0">
                                          <div class="list-action-children-content">
                                            <template v-for="(child, idx) in item.children" :key="idx">
                                              <div
                                                :key="idx"
                                                v-if="child.visible(record)"
                                                class="item"
                                                @click.stop="child.exe(record)"
                                              >
                                                <oio-icon size="14" :icon="child.icon"></oio-icon>
                                                <span class="child-action-label">{{ child.displayName }}</span>
                                              </div>
                                            </template>
                                          </div>
                                        </div>
                                      </template>

                                      <div class="item" @click="item.exe(record)">
                                        <oio-icon size="14" :icon="item.icon"></oio-icon>
                                        <span class="action-label">{{ item.displayName }}</span>

                                        <oio-icon
                                          size="14"
                                          icon="oinone-zhutixiala"
                                          v-if="item.children"
                                          style="transform: rotate(-90deg)"
                                        ></oio-icon>
                                      </div>
                                    </a-popover>
                                  </div>
                                </template>
                              </div>
                            </template>
                            <i class="iconfont oinone-gengduo2" />
                          </a-popover>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="page" v-if="!isEmpty">
            <oio-pagination
              showTotal
              showJumper
              :current-page="pagination.current"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              @change="onPaginationChange"
            >
            </oio-pagination>
          </div>
          <oio-empty-data v-else />
        </div>
      </div>
    </oio-spin>
  </div>
</template>
<script lang="ts">
import { executeViewAction, genStaticPath, RedirectTargetEnum, translateValueByKey } from '@oinone/kunlun-engine';
import { getRouterInstance, useMatched } from '@oinone/kunlun-router';
import { getModel } from '@oinone/kunlun-service';
import { CastHelper, OioButton, OioEmptyData, OioIcon, OioPagination, OioSpin } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, ref, watch } from 'vue';

import { onJumpCodeFuse, onJumpModelDesigner, onJumpUiDesignerHomePage, onJumpWorkflowDesigner } from '../../../util';
import { installAppFun, uninstallAppFun } from './service';
import { AppState } from './type';

export default defineComponent({
  props: [
    'dataSource',
    'pagination',
    'onPaginationChange',
    'moduleCategory',
    'onChangeCategory',
    'loading',
    'onUnLikeApp',
    'onLikeApp',
    'genStaticPath',
    'bindAppHomepage',
    'clickBindHomepageViewAction',
    'clickCreateViewAction',
    'clickUpdateViewAction',
    'actionPermission',
    'moreActions'
  ],
  components: {
    OioButton,
    OioSpin,
    OioEmptyData,
    OioPagination,
    OioIcon
  },
  setup(props) {
    const active = ref(-1);
    const allModuleLength = ref(0);
    const router = getRouterInstance();
    const { matched } = useMatched();

    const isEmpty = computed(() => {
      if (props.dataSource && props.dataSource.length) {
        return false;
      }

      return true;
    });

    const onSwitchLike = (record) => {
      if (record.like && props.actionPermission.hasUnLikeAction) {
        props.onUnLikeApp(record.module);
      } else {
        props.actionPermission.hasLikeAction && props.onLikeApp(record.module);
      }

      record.like = !record.like;
    };

    const onModelDesigner = async (item, displayType: 'list' | 'graph' = 'list') => {
      onJumpModelDesigner(item, displayType);
    };

    const onPageDesignerBlank = async (item) => {
      onJumpUiDesignerHomePage(item);
    };

    const onWorkflowDesigner = (item) => {
      onJumpWorkflowDesigner(item.module);
    };

    const moreActionItemNode = (index, id) => {
      return document.getElementById(`app-gallery-popup-content-item-${index}${id}`);
    };

    const onKnowMore = async (record) => {
      const model = await getModel('apps.AppsManagementModule');
      const action = model?.viewActionList?.filter((v) => v.name === 'apps_business_screen_detail')[0];
      if (action) {
        executeViewAction(
          CastHelper.cast(action),
          router,
          matched,
          { appsManagementModule: {}, id: record.id, state: record.state },
          RedirectTargetEnum.BLANK
        );
      }
    };

    const installApp = async (record) => {
      const result = await installAppFun(record.id);
      if (result.state) {
        record.state = result.state;
      }
    };

    const unInstallApp = async (record) => {
      const result = await uninstallAppFun(record.id);
      if (result.state) {
        record.state = result.state;
      }
    };

    const onCodeFuse = (record) => {
      onJumpCodeFuse(record.id);
    };

    watch(
      () => props.dataSource,
      () => {
        if (active.value === -1) {
          allModuleLength.value = props.pagination.total;
        }
      }
    );

    return {
      isEmpty,
      active,

      allModuleLength,
      installApp,
      unInstallApp,
      onSwitchLike,
      onModelDesigner,
      onWorkflowDesigner,
      onKnowMore,
      onPageDesignerBlank,
      onCodeFuse,
      AppState,
      translateValueByKey,
      moreActionItemNode,

      appTag: `${genStaticPath('标签1_1651399484151.png')}`,
      moduleTag: `${genStaticPath('标签2_1651399538680.png')}`
    };
  }
});
</script>

<style lang="scss">
.gallery-header {
  display: flex;
  align-items: center;

  .create-app {
    width: 250px;
    margin-right: var(--oio-margin-lg);
  }

  .search-view {
    flex: 1;
    background: transparent;
    padding: 0;
    border: none;

    .expand-button {
      display: none;
    }
  }
}
</style>

<template>
  <van-popup
    :show="showMask"
    @update:show="(show) => $emit('update:showMask', show)"
    teleport="body"
    round
    class="mobile-app-switcher-popup"
    position="bottom"
    safe-area-inset-bottom
    style="width: 100%; height: 90%"
  >
    <div class="mobile-app-switcher-popup-header">
      <van-search
        v-model="searchValue"
        :show-action="searchFocus"
        ref="searchInputNode"
        :placeholder="translateValueByKey('请输入搜索关键词')"
        @cancel="cancelHandle"
        @focus="searchFocus = true"
        @click-input="onSwitchSearch"
      />
    </div>
    <div class="mobile-app-switcher-popup-content">
      <div class="app-mask-container" :class="hideMask && 'app-mask-container-hide'" @click.stop="onClose">
        <div class="mask-container" @click.stop="onClose">
          <div class="mask-content" v-if="!showSearch">
            <div class="app-tabs" :class="!likeApp.length && 'app-tabs-fast'">
              <div class="tabs" @click.stop>
                <div class="common-title tab" @click.stop="active = 0" :class="[active === 0 && 'active']">
                  {{ translateValueByKey('全部') }}
                </div>
                <div class="common-title tab" @click.stop="active = 1" :class="[active === 1 && 'active']">
                  {{ translateValueByKey('收藏') }}
                </div>
              </div>
              <div
                class="app-collection-list"
                v-if="currentApps.length"
                @click.stop
                :class="!likeApp.length && 'app-collection-list-fast'"
              >
                <div
                  class="app-collection-item animation"
                  v-for="app of currentApps"
                  :key="app.id"
                  @click.stop="onJump(app)"
                >
                  <div class="app-collection-item-img">
                    <img :src="app.logo || genStaticPath('default.png')" alt="" />
                  </div>
                  <div class="text">{{ app.displayName || app.name }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="mask-content" v-if="showSearch">
            <div class="app-tabs">
              <div class="app-collection-list" v-if="searchApps.length">
                <div
                  class="app-collection-item animation"
                  v-for="app of searchApps"
                  :key="app.id"
                  @click.stop="onJump(app)"
                >
                  <div class="app-collection-item-img">
                    <img :src="app.logo || genStaticPath('default.png')" alt="" />
                  </div>
                  <div class="text">{{ app.displayName || app.name }}</div>
                </div>
              </div>
              <!--            <div v-else class="empty">暂无搜索结果</div>-->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mobile-app-switcher-popup-footer" @click.stop="onClose">
      <oio-button v-if="!isRunModeSAP" type="ghost" plain round @click="goToWorkbenchPage"
        ><template #icon><i class="iconfont oinone-guanwangshouye" /></template>{{ translateValueByKey('工作台') }}</oio-button
      >
    </div>
  </van-popup>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { Popup as VanPopup, Search as VanSearch } from 'vant';
import { OioButton } from '@kunlun/vue-ui-mobile-vant';
import { genStaticPath } from '@kunlun/engine';
import { translateValueByKey } from '@kunlun/engine';
import { isMiniProgram } from '../../util';

export default defineComponent({
  components: { VanPopup, VanSearch, OioButton },
  props: {
    apps: {
      type: Array
    },
    likeApp: {
      type: Array
    },
    switchApp: {
      type: Function,
      required: true
    },
    onCollectionClick: {
      type: Function,
      required: true
    },
    showMask: {
      type: Boolean
    }
  },
  emits: ['update:showMask'],

  setup(props, { emit }) {
    const active = ref(0);
    const searchValue = ref('');
    const searchFocus = ref(false);
    const showSearch = ref(false);
    const searchInputNode = ref<HTMLInputElement>(null as any);
    const hideMask = ref(false);

    const searchApps = computed(() => {
      return searchValue.value ? props.apps?.filter((a: any) => a.displayName.includes(searchValue.value)) : [];
    });

    const onSwitchSearch = () => {
      showSearch.value = true;

      nextTick(() => {
        searchInputNode.value.focus();
      });
    };

    const onJump = (app) => {
      emit('update:showMask', false);
      props.switchApp(app);
    };

    const onClose = (e) => {
      if (showSearch.value === true) {
        showSearch.value = false;
      } else {
        hideMask.value = true;

        const t = setTimeout(() => {
          hideMask.value = false;
          emit('update:showMask', false);
          clearTimeout(t);
        }, 400);
      }
    };

    const designerCategory = ['BUSINESS_PROCESS', 'USER_EXPERIENCE'];

    const currentApps = ref([] as any[]);
    watch(
      active,
      () => {
        currentApps.value = [] as any[];
        // 加延迟，不然已经出现在上次列表中的数据的动画效果会丢失部分
        nextTick(() => {
          if (active.value === 0) {
            currentApps.value = props.apps?.filter((a: any) => !designerCategory.includes(a.category))!;
          } else {
            currentApps.value = props.likeApp?.filter((a: any) => !designerCategory.includes(a.category))!;
          }
        });
      },
      {
        immediate: true
      }
    );

    const miniProgram = computed(() => isMiniProgram());
    function goToWorkbenchPage() {
      if (miniProgram.value) {
        const { uni } = window as any;
        // uni.postMessage({
        //   data: {
        //     action: 'goto_workbench'
        //   }
        // });
        // // 小程序端应用会在此页面后退时接收到消息，所以在发送消息后马上通过后退功能关闭当前webview
        // uni.navigateBack({
        //   delta: 1
        // });
        uni.switchTab({ url: '/pages/index/index' });
      } else {
        location.href = '/#/pages/index/index';
      }
    }

    function cancelHandle(e) {
      searchFocus.value = false;
      showSearch.value = false;
    }

    const isRunModeSAP = computed(() => !process.env.RUN_MODE || process.env.RUN_MODE === 'SAP');

    return {
      isRunModeSAP,
      cancelHandle,
      hideMask,
      active,
      searchValue,
      currentApps,
      showSearch,
      searchApps,
      searchInputNode,
      searchFocus,
      onSwitchSearch,
      onJump,
      onClose,
      goToWorkbenchPage,
      genStaticPath,
      translateValueByKey
    };
  }
});
</script>

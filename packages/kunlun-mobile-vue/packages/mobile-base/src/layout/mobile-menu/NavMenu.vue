<template>
  <nav-bar
    v-if="!miniProgram"
    class="mobile-nav-bar"
    safe-area-inset-top
    fixed
    :left-arrow="allowBack"
    @click-left="goHistory"
  >
    <!--    <template #left>-->
    <!--      <van-icon name="arrow-left" @click="goHistory" />-->
    <!--    </template>-->
    <template #title>{{ navTitle }} </template>
    <template #right>
      <div class="global-menu-btn" v-if="showKeywordSearch" @click="changeKeywordSearchPopup(true)">
        <i class="menu-icon iconfont oinone-sousuo1" />
      </div>
      <slot name="appSwitcher" />
      <div class="global-menu-btn" v-if="showMenu" @click="showMenuPopup = true">
        <i class="menu-icon iconfont oinone-caidan1" />
      </div>
    </template>
  </nav-bar>
  <free-draggable v-else class="global-menu-group">
    <div class="global-menu-btn" v-if="showKeywordSearch" @click="changeKeywordSearchPopup(true)">
      <i class="menu-icon iconfont oinone-sousuo1" />
    </div>
    <slot name="appSwitcher" />
    <div class="global-menu-btn" v-if="showMenu" @click="showMenuPopup = true">
      <i class="menu-icon iconfont oinone-caidan1" />
    </div>
  </free-draggable>
  <van-popup
    v-model:show="showMenuPopup"
    teleport="body"
    class="mobile-menu-popup"
    position="right"
    style="width: 90%; height: 100%"
    safe-area-inset-top
    safe-area-inset-bottom
  >
    <div class="k-m-user">
      <img class="k-m-user-avatar" :src="pamirsUser.avatarUrl || genStaticPath('man_1651543408256.png')" />
      <div class="k-m-user-name" v-if="hasCurrentUser">
        {{ pamirsUser.nickname || pamirsUser.name || pamirsUser.realname }}
      </div>
      <div class="k-m-user-logout" @click="logout"><i class="iconfont oinone-tuichu" /></div>
    </div>
    <search v-if="showSearchInput" v-model="menuSearchKey" :placeholder="translateValueByKey('请输入搜索关键词')" />
    <div class="menu-component" v-if="treeNodes && treeNodes.length">
      <menu-component
        :menus="menus"
        :tree-nodes="usableMenus"
        :active-menu-id="currentMenuId"
        :open-keys="openKeys"
        :expand="!!menuSearchKey"
        @selected="onMenuSelected"
      />
    </div>
  </van-popup>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { Icon as VanIcon, Popup as VanPopup, Search, NavBar } from 'vant';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { cloneDeep } from 'lodash-es';
import { genStaticPath, translateValueByKey } from '@oinone/kunlun-engine';
import MenuComponent from './Menu.vue';
import { isMiniProgram } from '../../util';
import FreeDraggable from './FreeDraggable.vue';

export default defineComponent({
  props: [
    'mode',
    'collapsed',
    'module',
    'onClick',
    'showMenu',
    'allowBack',
    'openChange',
    'selectKeys',
    'openKeys',
    'menus',
    'treeNodes',
    'currentMenuId',
    'translate',
    'navTitle',
    'onChangeCollapsed',
    'showKeywordSearch',
    'logout',
    'changeKeywordSearchPopup',
    'userInfo'
  ],
  components: {
    VanIcon,
    VanPopup,
    OioIcon,
    Search,
    NavBar,
    MenuComponent,
    FreeDraggable
  },
  setup(props) {
    const miniProgram = computed(() => isMiniProgram());
    const showLeftArrow = computed(() => !process.env.RUN_MODE || process.env.RUN_MODE === 'SAP');
    const appSearchKey = ref('');
    const menuSearchKey = ref('');
    const showAppPopup = ref(false);
    const showMenuPopup = ref(false);

    const onMenuSelected = ({ menu, parentMenuPath }) => {
      if (props.onClick) {
        props.onClick(menu, parentMenuPath);
        showMenuPopup.value = false;
      }
    };

    function goHistory() {
      history.go(-1);
    }

    const showSearchInput = computed(() => {
      if (props.menus.length < 10) {
        return props.menus.find((a) => a.children && a.children.length);
      }
      return true;
    });

    const usableMenus = computed(() => {
      const find = (list) => {
        return cloneDeep(list).filter((a) => {
          if (a.value.displayName.includes(menuSearchKey.value)) {
            return true;
          }
          if (a.children && a.children.length) {
            const hasChildren = find(a.children);
            if (hasChildren.length) {
              a.children = hasChildren;
              return true;
            }
          }
          return false;
        });
      };

      return find(props.treeNodes || []);
    });

    watch(
      () => props.module,
      (newVal, oldVal) => {
        if (newVal && oldVal && newVal.module !== oldVal.module) {
          menuSearchKey.value = '';
        }
      },
      { deep: true }
    );

    const pamirsUser = computed(() => (props.userInfo ? props.userInfo.pamirsUser || {} : {}));
    const hasCurrentUser = computed(() => {
      return !!props.userInfo?.pamirsUser;
    });

    return {
      showSearchInput,
      usableMenus,
      miniProgram,
      goHistory,
      onMenuSelected,
      showAppPopup,
      showMenuPopup,
      appSearchKey,
      menuSearchKey,
      pamirsUser,
      hasCurrentUser,
      genStaticPath,
      translateValueByKey
    };
  }
});
</script>

<template>
  <div class="k-oinone-application" @click="onShowMask">
    <!-- 预加载图片 start -->
    <img style="display: none" :src="`${genStaticPath('背景1_1650609329143.png')}`" alt="" />
    <img style="display: none" :src="`${genStaticPath('背景_1651138497267.png')}`" alt="" />
    <!-- 预加载图片 end -->

    <div class="logo">
      <div
        class="logo-background"
        :style="{
          backgroundImage: `url('${collapsed ? collapsedLogo || DEFAULT_APPLICATION_LOGO() : logo}')`
        }"
      ></div>
    </div>
    <div class="app-name">
      <span class="app-name-module" :title="appLabel">{{ appLabel }}</span>
      <caret-down-outlined v-if="!isSingleApps" />
    </div>
    <div v-show="showMask">
      <app-switcher-mask
        v-model:showMask="showMask"
        :apps="apps"
        :genStaticPath="genStaticPath"
        :likeApp="likeApp"
        :onCollectionClick="onCollectionClick"
        @switch-app="onSwitchApp"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { CaretDownOutlined } from '@ant-design/icons-vue';
import { IModule } from '@kunlun/meta';
import { computed, defineComponent, PropType, ref } from 'vue';
import { DEFAULT_APPLICATION_LOGO } from '../../typing';
import AppSwitcherMask from './AppSwitcherMask.vue';

export default defineComponent({
  name: 'AppSwitcher',
  components: {
    CaretDownOutlined,
    AppSwitcherMask
  },
  inheritAttrs: false,
  props: {
    apps: {
      type: Array as PropType<IModule[]>,
      default: () => []
    },
    module: {
      type: Object as PropType<IModule>
    },
    logo: {
      type: String
    },
    collapsedLogo: {
      type: String
    },
    collapsed: {
      type: Boolean,
      default: undefined
    },
    likeApp: {
      type: Array as PropType<IModule[]>
    },
    onCollectionClick: {
      type: Function
    },
    onSwitchApp: {
      type: Function
    },
    genStaticPath: {
      type: Function
    },
    currentPageUrl: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const apps = computed(() => {
      return props.apps || [];
    });

    const appLabel = computed(() => {
      return props.module?.displayName || props.module?.name;
    });

    const collapsed = computed(() => {
      return props.collapsed || false;
    });

    const isSingleApps = computed(() => {
      if (props.apps.length === 0) {
        return true;
      }

      if (props.apps.length === 1) {
        const [firstApp] = props.apps;
        const { module } = props.currentPageUrl;
        if (module !== firstApp.name) {
          return false;
        }
        return true;
      }

      return false;
    });

    const showMask = ref(false);

    const onShowMask = () => {
      if (isSingleApps.value) {
        return;
      }

      showMask.value = true;
    };

    return {
      DEFAULT_APPLICATION_LOGO,
      apps,
      appLabel,
      collapsed,
      showMask,
      isSingleApps,

      onShowMask
    };
  }
});
</script>

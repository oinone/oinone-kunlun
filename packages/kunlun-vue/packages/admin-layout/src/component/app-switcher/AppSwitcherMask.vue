<template>
  <div
    :class="['application-mask-container', hideMask && 'application-mask-container-hide']"
    :style="{
      'background-image': `url(${genStaticPath('背景1_1650609329143.png')})`
    }"
    @click.stop="onClose"
  >
    <div class="application-mask-close" @click.stop="onClose">
      <i class="iconfont oinone-fanhui"></i>
    </div>
    <div
      class="mask-container"
      @click.stop="onClose"
      :style="{
        'background-image': `url(${genStaticPath('背景_1651138497267.png')})`
      }"
    >
      <img class="application-mask-container-watermark" :src="genStaticPath('app-finder-bg.png')" />
      <div class="mask-content" v-if="!showSearch">
        <div class="application-collection" @click.stop v-if="likeApp && likeApp.length && !showSearch">
          <div class="common-title">{{ translateValueByKey('我收藏的应用') }}</div>
          <div class="application-collection-list collection-list-content">
            <div
              class="application-collection-item animation"
              v-for="(item, index) in likeApp"
              :key="index"
              @click.stop="$emit('update:showMask', false), onCollectionClick(item)"
            >
              <div style="width: 70px; height: 70px">
                <img :src="item.logo || DEFAULT_APPLICATION_LOGO()" alt="" />
              </div>
              <div class="text">{{ item.displayName || item.name }}</div>
            </div>
          </div>
        </div>

        <div class="application-tabs" :class="!likeApp.length && 'application-tabs-fast'">
          <div class="tabs" @click.stop>
            <div
              class="common-title tab"
              v-if="hasBusiness"
              @click.stop="active = 0"
              :class="[active === 0 && 'active']"
            >
              {{ translateValueByKey('业务应用') }}
            </div>
            <div
              class="common-title tab"
              v-if="hasDesigner"
              @click.stop="active = 1"
              :class="[active === 1 && 'active']"
            >
              {{ translateValueByKey('设计器') }}
            </div>
          </div>
          <div
            class="application-collection-list"
            @click.stop
            :class="!likeApp.length && 'application-collection-list-fast'"
          >
            <div
              class="application-collection-item animation"
              v-for="app of currentApps"
              :key="app.id"
              @click.stop="onJump(app)"
            >
              <div style="width: 70px; height: 70px">
                <img :src="app.logo || genStaticPath('default.png')" alt="" />
              </div>
              <div class="text">{{ app.displayName || app.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="search-icon" @click.stop="onSwitchSearch" v-if="!showSearch">
        <oio-icon icon="oinone-sousuo" size="16" color="#fff"></oio-icon>
      </div>
      <div class="search-content" v-if="showSearch">
        <div class="search-wrapper" @click.stop>
          <oio-icon class="left-icon" icon="oinone-sousuo" size="16" color="#fff"></oio-icon>
          <input type="text" v-model="searchValue" ref="searchInputNode" />
          <oio-icon
            class="right-icon"
            icon="oinone-qingchu"
            size="16"
            v-if="searchValue"
            @click="searchValue = ''"
          ></oio-icon>
        </div>

        <div class="application-collection-list" style="margin-top: 24px; width: 100%">
          <div
            class="application-collection-item animation"
            v-for="app of searchApps"
            :key="app.id"
            @click.stop="onJump(app)"
          >
            <div style="width: 70px; height: 70px">
              <img :src="app.logo || DEFAULT_APPLICATION_LOGO()" alt="" />
            </div>
            <div class="text">{{ app.displayName || app.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { genStaticPath, translateValueByKey } from '@kunlun/engine';
import { IModule } from '@kunlun/meta';
import { OioIcon } from '@kunlun/vue-ui-antd';

import { computed, defineComponent, nextTick, PropType, ref, watch } from 'vue';
import { DEFAULT_APPLICATION_LOGO } from '../../typing';

export default defineComponent({
  name: 'AppSwitcherMask',
  props: {
    apps: {
      type: Array as PropType<IModule[]>
    },
    likeApp: {
      type: Array as PropType<IModule[]>
    },
    onCollectionClick: {
      type: Function,
      required: true
    },
    genStaticPath: {
      type: Function,
      default: genStaticPath
    },
    showMask: {
      type: Boolean
    }
  },
  emits: ['update:showMask', 'switch-app'],
  components: {
    OioIcon
  },
  setup(props, { emit }) {
    const active = ref(0);
    const searchValue = ref('');
    const showSearch = ref(false);
    const searchInputNode = ref<HTMLInputElement>(null as any);
    const internalHideMask = ref(false);
    const hideMask = computed<boolean>({
      get: () => {
        return internalHideMask.value || !props.showMask;
      },
      set: (val) => {
        internalHideMask.value = val;
      }
    });

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
      emit('switch-app', app);
    };

    const onClose = () => {
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

    const hasDesigner = computed(() => {
      return props.apps?.find((a: any) => designerCategory.includes(a.category));
    });

    const hasBusiness = computed(() => props.apps?.find((a: any) => !designerCategory.includes(a.category)));

    const currentApps = computed(() => {
      if (active.value === 0) {
        return props.apps?.filter((a: any) => !designerCategory.includes(a.category));
      }

      return props.apps?.filter((a: any) => designerCategory.includes(a.category));
    });

    watch(
      () => props.showMask,
      (val) => {
        if (val) {
          if (!hasBusiness.value && active.value === 0) {
            active.value = 1;
          }
        }
      },
      {
        deep: true
      }
    );

    return {
      DEFAULT_APPLICATION_LOGO,

      hasBusiness,
      hideMask,
      active,
      searchValue,
      currentApps,
      showSearch,
      searchApps,
      searchInputNode,
      hasDesigner,
      onSwitchSearch,
      onJump,
      onClose,
      translateValueByKey
    };
  }
});
</script>

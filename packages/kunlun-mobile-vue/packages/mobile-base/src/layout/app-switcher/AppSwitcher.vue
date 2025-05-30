<template>
  <div class="mobile-app-switcher">
    <div class="global-menu-btn">
      <i class="menu-icon iconfont" :class="[ isLike ? 'oinone-shoucang module-liked' : 'oinone-weishoucang']" @click="toggleLike" />
    </div>
    <div class="global-menu-btn">
      <i class="menu-icon iconfont oinone-qiehuanfanggeliebiao" @click="onShowMask" />
    </div>
    <div v-if="showMask">
      <app-switcher-mask
        v-model:showMask="showMask"
        :apps="apps"
        :switchApp="switchApp"
        :likeApp="likeApp"
        :onCollectionClick="onCollectionClick"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import AppSwitcherMask from './AppSwitcherMask.vue';
import { Toast as VanToast } from 'vant';

export default defineComponent({
  props: [
    'updateMask',
    'module',
    'isMaskVisible',
    'apps',
    'switchApp',
    'likeApp',
    'onCollectionClick',
    'likeApp',
    'queryLikeApp',
    'logo',
    'collapsed',
    'collapsedLogo',
    'isLike',
    'onSwitchLike'
  ],
  components: {
    AppSwitcherMask,
    VanToast
  },
  setup(props) {
    const showMask = ref(false);
    const realCollapsed = computed(() => {
      return props.collapsed || false;
    });

    const appLabel = computed(() => {
      return props.module?.displayName || props.module?.name;
    });

    onMounted(() => {
      props.queryLikeApp();
    });

    const onShowMask = async () => {
      showMask.value = true;
    };

     async function toggleLike() {
      const toast = VanToast.loading({
        duration: 0,
        forbidClick: true,
      });
      await props.onSwitchLike?.();
      toast.clear();
    }

    return { appLabel, realCollapsed, showMask, onShowMask, toggleLike };
  }
});
</script>

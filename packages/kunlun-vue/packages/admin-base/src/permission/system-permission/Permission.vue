<template>
  <oio-spin wrapper-class-name="permission-view-spin" :loading="store.loading" ref="nodeRef">
    <div class="permission-view-container">
      <div class="left-menu hidden">
        <left-menu @checked-tree="onCheckedTree" />
      </div>
      <div class="right-config hidden">
        <right-config :selected-left-tree="selectedLeftTree" />
      </div>
    </div>
  </oio-spin>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, onBeforeUnmount, onActivated, onDeactivated, defineProps } from 'vue';
import { OioSpin } from '@kunlun/vue-ui-antd';
import LeftMenu from './components/Menu.vue';
import RightConfig from './components/Config.vue';
import { useStore } from './store';
import { IPermissionDslActions } from './types';
import { useDslActionPermission } from './hooks';

const props = defineProps<{ permissionActions: IPermissionDslActions }>();

useDslActionPermission().use(props);

const store = useStore();

const selectedLeftTree = ref([]);
const nodeRef = ref<HTMLElement>();

const onCheckedTree = (list) => {
  selectedLeftTree.value = list;
};

const setDomStyle = (reset = false) => {
  const contentNode = document.querySelector('.k-layout-content') as HTMLElement;
  if (contentNode) {
    contentNode.style.overflow = reset ? 'auto' : 'hidden';
  }

  const blockNode = document.querySelector('.k-layout-content > .k-layout-block') as HTMLElement;

  if (blockNode) {
    blockNode.style.height = reset ? 'auto' : '100%';
    blockNode.style.overflow = reset ? 'auto' : 'hidden';
  }

  const widgetNode = document.querySelector('.k-layout-content > .k-layout-block > .k-layout-widget') as HTMLElement;

  if (widgetNode) {
    widgetNode.style.height = reset ? 'auto' : '100%';
  }
};

onMounted(() => {
  nextTick(() => {
    const node = (nodeRef.value! as any).$el as HTMLElement;
    node.parentElement!.style.height = '100%';
    node.parentElement!.style.overflow = 'hidden';
    setDomStyle();
  });
});

onActivated(() => {
  nextTick(() => {
    setDomStyle();
  });
});

onDeactivated(() => {
  setDomStyle(true);
});

onBeforeUnmount(() => {
  store.reset();
  setDomStyle(true);
});
</script>

<style lang="scss">
@import './style/permission.scss';
</style>

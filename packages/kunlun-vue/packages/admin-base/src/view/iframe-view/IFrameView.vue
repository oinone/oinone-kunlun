<template>
  <div class="iframe-view-wrapper">
    <iframe :src="frameUrl" width="100%" height="100%" frameborder="none"></iframe>
    <div class="iframe-menu-wrapper" @click.stop="onMenuCollapsedChange(true)">
      <div
        class="iframe-oinone-icon"
        :style="{
          'background-image': `url(${genStaticPath('appSideLogo.png')})`
        }"
      ></div>
      <div class="icon-wrapper"><i class="iconfont oinone-zhankaicaidan" /></div>
    </div>
    <div class="iframe-all-menus" :class="menuCollapsed ? 'expand' : ''">
      <div class="iframe-menu-icon">
        <img :src="`${genStaticPath('appSideLogo.png')}`" />
      </div>
      <Menu :onMenuCollapsedChange="onMenuCollapsedChange" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import Menu from './menu/Menu.vue';

export default defineComponent({
  name: 'IFrame-view',
  components: { Menu },
  props: {
    frameUrl: {
      type: String,
      default: ''
    },
    showMenu: {
      type: Boolean,
      default: false
    },
    genStaticPath: {
      type: Function,
      default: () => {}
    }
  },
  setup() {
    const menuCollapsed = ref<boolean>(false);
    const onMenuCollapsedChange = (value: boolean) => {
      menuCollapsed.value = value;
    };

    return { menuCollapsed, onMenuCollapsedChange };
  }
});
</script>

<style lang="scss">
.iframe-view-wrapper {
  width: 100%;
  height: 100%;
  position: relative;

  .iframe-menu-wrapper {
    width: 64px;
    height: 106px;
    background: #ffffff;
    box-shadow: 0px 2px 6px 0px rgba(136, 156, 176, 0.1);
    border-radius: 8px;
    position: absolute;
    bottom: var(--oio-paas-menu-iframe-top, 169px);
    left: var(--oio-paas-menu-iframe-left, 12px);
    padding: 12px;
    cursor: pointer;

    .iframe-oinone-icon {
      width: 30px;
      height: 30px;
      background-repeat: no-repeat;
      background-size: cover;
      display: flex;
      justify-content: center;
      margin: auto;
    }

    .icon-wrapper {
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      display: flex;
      align-items: center;
      margin: auto;
      justify-content: center;
      margin-top: 12px;

      i {
        font-size: 16px;
        color: #919dac;
      }
    }
  }

  .iframe-all-menus {
    position: absolute;
    bottom: var(--oio-paas-menu-iframe-top, 169px);
    left: var(--oio-paas-menu-iframe-left, 12px);
    width: 0;
    height: 0;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0px 2px 6px 0px rgba(136, 156, 176, 0.1);
    border-radius: 8px;
    transition: all ease 0.3s;
    opacity: 0;

    .menu-wrapper {
      height: calc(100% - 78px);
    }

    .iframe-menu-icon {
      height: 78px;
      padding: var(--oio-padding);

      img {
        height: 30px;
      }
    }
  }

  .expand {
    width: 208px;
    height: 500px;
    opacity: 1;
  }

  .collapsed {
    cursor: pointer;
    margin: 24px 0 24px 24px;
    height: 40px;
    line-height: 40px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    padding: 0 16px;
    box-sizing: border-box;
    font-size: 14px;
    width: 152px;
    overflow: hidden;
    color: #919dac;
    justify-content: space-between;

    &.close {
      width: 50px;
    }

    i {
      font-size: 16px;
      color: #919dac;
    }

    span {
      margin-left: 10px;
    }
  }
}
</style>

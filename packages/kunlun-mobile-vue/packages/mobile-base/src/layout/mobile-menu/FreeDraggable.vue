<template>
  <div class="free-draggable" ref="fu">
    <slot />
    <div
      class="global-menu-btn global-menu-btn-move-handler"
      @mousedown="down"
      @touchstart="down"
      @mousemove="move"
      @touchmove="move"
      @mouseup="end"
      @touchend="end"
      ref="moveHandler"
    >
      <i class="menu-icon iconfont oinone-move-handler" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { Icon } from 'vant';

export default defineComponent({
  props: {},
  components: {},
  setup() {},
  data() {
    return {
      flags: false, //控制使用
      position: { x: 0, y: 0 },
      nx: 0,
      ny: 0,
      dx: 0,
      dy: 0,
      xPum: 0,
      yPum: 0
    };
  },
  methods: {
    down(event) {
      this.flags = true;
      let touch;
      if (event.touches) {
        touch = event.touches[0];
      } else {
        touch = event;
      }
      this.position.x = touch.clientX;
      this.position.y = touch.clientY;
      this.dx = (this.$refs as any)?.fu.offsetLeft;
      this.dy = (this.$refs as any)?.fu.offsetTop;
    },
    move(event) {
      if (this.flags) {
        let touch: any;
        if (event.touches) {
          touch = event.touches[0];
        } else {
          touch = event;
        }
        this.nx = touch.clientX - this.position.x;
        this.ny = touch.clientY - this.position.y;
        this.xPum = this.dx + this.nx;
        this.yPum = this.dy + this.ny;
        let width = window.innerWidth - (this.$refs as any).fu.offsetWidth; //屏幕宽度减去自身控件宽度
        let height = window.innerHeight - (this.$refs as any).fu.offsetHeight; //屏幕高度减去自身控件高度
        this.xPum < 0 && (this.xPum = 0);
        this.yPum < 0 && (this.yPum = 0);
        this.xPum > width && (this.xPum = width);
        this.yPum > height && (this.yPum = height);
        if (this.xPum >= 0 && this.yPum >= 0 && this.xPum <= width && this.yPum <= height) {
          (this.$refs as any).fu.style.left = this.xPum + 'px';
          (this.$refs as any).fu.style.top = this.yPum + 'px';
        } //阻止页面的滑动默认事件
        document.addEventListener(
          'touchmove',
          function () {
            event.preventDefault();
          },
          false
        );
      }
    }, //鼠标释放时候的函数
    end() {
      this.flags = false;
    }
  }
});
</script>

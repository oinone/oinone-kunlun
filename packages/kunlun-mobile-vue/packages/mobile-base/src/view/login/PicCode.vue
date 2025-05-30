<template>
  <div class="s-canvas" @click="click">
    <canvas id="s-canvas" :width="contentWidth" :height="contentHeight"></canvas>
  </div>
</template>
<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SIdentify',
  props: {
    identifyCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fontSizeMin: 20,
      fontSizeMax: 40,
      backgroundColorMin: 180,
      backgroundColorMax: 240,
      colorMin: 50,
      colorMax: 160,
      lineColorMin: 40,
      lineColorMax: 180,
      dotColorMin: 0,
      dotColorMax: 255,
      contentWidth: 112,
      contentHeight: 38
    };
  },
  methods: {
    // 生成一个随机数
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    drawPic() {
      if (!this.identifyCode) return false;
      let canvas = document.getElementById('s-canvas');
      let ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.contentWidth, this.contentHeight);
      // 绘制背景
      ctx.fillStyle = 'transparent'; //图形填充颜色设置
      ctx.strokeStyle = 'transparent'; //图形轮廓的颜色设置
      ctx.fillRect(0, 0, this.contentWidth, this.contentHeight); //绘制一个填充的矩形 0 0 width height x起点 y起点  宽 高
      ctx.strokeRect(0, 0, this.contentWidth, this.contentHeight); // 绘制一个矩形边框 0 0 width height x起点 y起点  宽 高
      // 绘制文字
      for (let i = 0; i < this.identifyCode.length; i++) {
        this.drawText(ctx, this.identifyCode[i], i);
      }
    },
    drawText(ctx, txt, i) {
      ctx.fillStyle = 'blue';
      ctx.font = this.randomNum(this.fontSizeMin, this.fontSizeMax) + 'px SimHei bold'; //字体大小
      ctx.textBaseline = 'alphabetic'; //基线对齐
      let x = (i + 1) * (this.contentWidth / (this.identifyCode.length + 1));
      let y = this.randomNum(this.fontSizeMax, this.contentHeight - 5);
      var deg = this.randomNum(-45, 45);
      // 修改坐标原点和旋转角度
      ctx.translate(x, y); //移动不同位置  参数偏移量
      ctx.rotate((deg * Math.PI) / 180); //旋转 参数角度
      ctx.fillText(txt, 0, 0);
      // 恢复坐标原点和旋转角度
      ctx.rotate((-deg * Math.PI) / 180);
      ctx.translate(-x, -y);
    },
    click() {
      this.$emit('click');
    }
  },
  watch: {
    identifyCode() {
      this.drawPic();
    }
  },
  mounted() {
    this.drawPic();
  }
});
</script>

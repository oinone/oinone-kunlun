<template>
  <div v-show="show" class="t-wrapper" @touchmove.stop.prevent="moveHandle" ref="currentRef">
    <div class="t-mask" :class="{ active: active }" @click.stop="close"></div>
    <div class="t-box" :class="{ active: active }">
      <div class="t-header">
        <div class="t-header-button" @click.stop="close">{{ $translate('取消') }}</div>
        <div class="t-header-button" @click.stop="confirm">{{ $translate('确认') }}</div>
      </div>
      <div class="t-color__box" :style="{ background: 'rgb(' + bgcolor.r + ',' + bgcolor.g + ',' + bgcolor.b + ')' }">
        <div
          class="t-background boxs"
          @touchstart="touchstart($event, 0)"
          @touchmove="touchmove($event, 0)"
          @touchend="touchend($event, 0)"
        >
          <div class="t-color-mask"></div>
          <div class="t-pointer" :style="{ top: site[0].top - 8 + 'px', left: site[0].left - 8 + 'px' }"></div>
        </div>
      </div>
      <div class="t-control__box">
        <div class="t-control__color">
          <div
            class="t-control__color-content"
            :style="{ background: 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')' }"
          ></div>
        </div>
        <div class="t-control-box__item">
          <div
            class="t-controller boxs"
            @touchstart="touchstart($event, 1)"
            @touchmove="touchmove($event, 1)"
            @touchend="touchend($event, 1)"
          >
            <div class="t-hue">
              <div class="t-circle" :style="{ left: site[1].left - 12 + 'px' }"></div>
            </div>
          </div>
          <div
            class="t-controller boxs"
            @touchstart="touchstart($event, 2)"
            @touchmove="touchmove($event, 2)"
            @touchend="touchend($event, 2)"
          >
            <div class="t-transparency">
              <div class="t-circle" :style="{ left: site[2].left - 12 + 'px' }"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="t-result__box">
        <div v-if="mode" class="t-result__item">
          <div class="t-result__box-input">{{ hex }}</div>
          <div class="t-result__box-text">HEX</div>
        </div>
        <template v-else>
          <div class="t-result__item">
            <div class="t-result__box-input">{{ rgba.r }}</div>
            <div class="t-result__box-text">R</div>
          </div>
          <div class="t-result__item">
            <div class="t-result__box-input">{{ rgba.g }}</div>
            <div class="t-result__box-text">G</div>
          </div>
          <div class="t-result__item">
            <div class="t-result__box-input">{{ rgba.b }}</div>
            <div class="t-result__box-text">B</div>
          </div>
          <div class="t-result__item">
            <div class="t-result__box-input">{{ rgba.a }}</div>
            <div class="t-result__box-text">A</div>
          </div>
        </template>

        <div class="t-result__item t-select" @click="select">
          <div class="t-result__box-input">
            <div>{{ $translate('切换') }}</div>
            <div>{{ $translate('模式') }}</div>
          </div>
        </div>
      </div>
      <div class="t-alternative">
        <div class="t-alternative__item" v-for="(item, index) in colorList" :key="index">
          <div
            class="t-alternative__item-content"
            :style="{ background: 'rgba(' + item.r + ',' + item.g + ',' + item.b + ',' + item.a + ')' }"
            @click="selectColor(item)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: Object,
      default() {
        return {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
      }
    },
    spareColor: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      show: false,
      active: false,
      // rgba 颜色
      rgba: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      },
      // hsb 颜色
      hsb: {
        h: 0,
        s: 0,
        b: 0
      },
      site: [
        {
          top: 0,
          left: 0
        },
        {
          left: 0
        },
        {
          left: 0
        }
      ],
      position: [],
      index: 0,
      bgcolor: {
        r: 255,
        g: 0,
        b: 0,
        a: 1
      },
      hex: '#000000',
      mode: true,
      colorList: [
        {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        }
      ]
    };
  },
  created() {
    this.rgba = this.color;
    if (this.spareColor.length !== 0) {
      this.colorList = this.spareColor;
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      // hsb 颜色
      this.hsb = this.rgbToHex(this.rgba);
      // this.setColor();
      this.setValue(this.rgba);
    },
    moveHandle() {},
    open() {
      this.show = true;
      this.$nextTick(() => {
        this.init();
        setTimeout(() => {
          this.active = true;
          setTimeout(() => {
            this.getSelectorQuery();
          }, 350);
        }, 50);
      });
    },
    close() {
      this.active = false;
      this.$nextTick(() => {
        setTimeout(() => {
          this.show = false;
          this.$emit('show', this.show);
        }, 500);
      });
    },
    confirm() {
      this.close();
      this.$emit('confirm', {
        rgba: this.rgba,
        hex: this.hex
      });
    },
    // 选择模式
    select() {
      this.mode = !this.mode;
    },
    // 常用颜色选择
    selectColor(item) {
      this.setColorBySelect(item);
    },
    touchstart(e, index) {
      const { pageX, pageY } = e.touches[0];
      this.pageX = pageX;
      this.pageY = pageY;
      this.setPosition(pageX, pageY, index);
    },
    touchmove(e, index) {
      const { pageX, pageY } = e.touches[0];
      this.moveX = pageX;
      this.moveY = pageY;
      this.setPosition(pageX, pageY, index);
    },
    touchend(e, index) {},
    /**
     * 设置位置
     */
    setPosition(x, y, index) {
      this.index = index;
      const { top, left, width, height } = this.position[index];
      // 设置最大最小值
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      y = y - scrollTop;
      this.site[index].left = Math.max(0, Math.min(x - left, width));
      if (index === 0) {
        this.site[index].top = Math.max(0, Math.min(y - top, height));

        // 设置颜色
        this.hsb.s = parseInt((100 * this.site[index].left) / width);
        this.hsb.b = parseInt(100 - (100 * this.site[index].top) / height);
        this.setColor();
        this.setValue(this.rgba);
      } else {
        this.setControl(index, this.site[index].left);
      }
    },
    /**
     * 设置 rgb 颜色
     */
    setColor() {
      const rgb = this.HSBToRGB(this.hsb);
      this.rgba.r = rgb.r;
      this.rgba.g = rgb.g;
      this.rgba.b = rgb.b;
    },
    /**
     * 设置二进制颜色
     * @param {Object} rgb
     */
    setValue(rgb) {
      this.hex = '#' + this.rgbToHex(rgb);
    },
    setControl(index, x) {
      const { top, left, width, height } = this.position[index];

      if (index === 1) {
        this.hsb.h = parseInt((360 * x) / width);
        this.bgcolor = this.HSBToRGB({
          h: this.hsb.h,
          s: 100,
          b: 100
        });
        this.setColor();
      } else {
        this.rgba.a = (x / width).toFixed(1);
      }
      this.setValue(this.rgba);
    },
    /**
     * rgb 转 二进制 hex
     * @param {Object} rgb
     */
    rgbToHex(rgb) {
      let hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
      hex.map(function (str, i) {
        if (str.length == 1) {
          hex[i] = '0' + str;
        }
      });
      return hex.join('');
    },
    setColorBySelect(getrgb) {
      const { r, g, b, a } = getrgb;
      let rgb = {};
      rgb = {
        r: r ? parseInt(r) : 0,
        g: g ? parseInt(g) : 0,
        b: b ? parseInt(b) : 0,
        a: a ? a : 0
      };
      this.rgba = rgb;
      this.hsb = this.rgbToHsb(rgb);
      this.changeViewByHsb();
    },
    changeViewByHsb() {
      const [a, b, c] = this.position;
      this.site[0].left = parseInt((this.hsb.s * a.width) / 100);
      this.site[0].top = parseInt(((100 - this.hsb.b) * a.height) / 100);
      this.setColor(this.hsb.h);
      this.setValue(this.rgba);
      this.bgcolor = this.HSBToRGB({
        h: this.hsb.h,
        s: 100,
        b: 100
      });

      this.site[1].left = (this.hsb.h / 360) * b.width;
      this.site[2].left = this.rgba.a * c.width;
    },
    /**
     * hsb 转 rgb
     * @param {Object} 颜色模式  H(hues)表示色相，S(saturation)表示饱和度，B（brightness）表示亮度
     */
    HSBToRGB(hsb) {
      let rgb = {};
      let h = Math.round(hsb.h);
      let s = Math.round((hsb.s * 255) / 100);
      let v = Math.round((hsb.b * 255) / 100);
      if (s == 0) {
        rgb.r = rgb.g = rgb.b = v;
      } else {
        let t1 = v;
        let t2 = ((255 - s) * v) / 255;
        let t3 = ((t1 - t2) * (h % 60)) / 60;
        if (h == 360) h = 0;
        if (h < 60) {
          rgb.r = t1;
          rgb.b = t2;
          rgb.g = t2 + t3;
        } else if (h < 120) {
          rgb.g = t1;
          rgb.b = t2;
          rgb.r = t1 - t3;
        } else if (h < 180) {
          rgb.g = t1;
          rgb.r = t2;
          rgb.b = t2 + t3;
        } else if (h < 240) {
          rgb.b = t1;
          rgb.r = t2;
          rgb.g = t1 - t3;
        } else if (h < 300) {
          rgb.b = t1;
          rgb.g = t2;
          rgb.r = t2 + t3;
        } else if (h < 360) {
          rgb.r = t1;
          rgb.g = t2;
          rgb.b = t1 - t3;
        } else {
          rgb.r = 0;
          rgb.g = 0;
          rgb.b = 0;
        }
      }
      return {
        r: Math.round(rgb.r),
        g: Math.round(rgb.g),
        b: Math.round(rgb.b)
      };
    },
    rgbToHsb(rgb) {
      let hsb = {
        h: 0,
        s: 0,
        b: 0
      };
      let min = Math.min(rgb.r, rgb.g, rgb.b);
      let max = Math.max(rgb.r, rgb.g, rgb.b);
      let delta = max - min;
      hsb.b = max;
      hsb.s = max != 0 ? (255 * delta) / max : 0;
      if (hsb.s != 0) {
        if (rgb.r == max) hsb.h = (rgb.g - rgb.b) / delta;
        else if (rgb.g == max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
        else hsb.h = 4 + (rgb.r - rgb.g) / delta;
      } else hsb.h = -1;
      hsb.h *= 60;
      if (hsb.h < 0) hsb.h = 0;
      hsb.s *= 100 / 255;
      hsb.b *= 100 / 255;
      return hsb;
    },
    getSelectorQuery() {
      const views = this.$refs.currentRef;
      const eleList = views.querySelectorAll('.boxs');
      const data = [];
      for (const ele of eleList) {
        data.push(ele.getBoundingClientRect());
      }
      if (!data || data.length === 0) {
        setTimeout(() => this.getSelectorQuery(), 20);
        return;
      }
      this.position = data;
      // this.site[0].top = data[0].height;
      // this.site[0].left = 0;
      // this.site[1].left = data[1].width;
      // this.site[2].left = data[2].width;
      this.setColorBySelect(this.rgba);
    }
  },
  watch: {
    spareColor: {
      handler(newVal) {
        this.colorList = newVal;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

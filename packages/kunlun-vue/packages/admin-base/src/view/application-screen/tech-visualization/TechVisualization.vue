<template>
  <div class="tech-visualization science" id="science-medial">
    <div class="tech-visualization-title"><i class="iconfont oinone-jiagou"></i>{{ title }}</div>
    <div class="wrapper">
      <div class="banner1 banner" :class="[opacityArr[0] && 'opacity']">
        <div class="main" @mouseenter="onMouseenter($event, 0)" @mouseleave="onMouseleave">
          <div class="tag-list uiPaaSTag">
            <div class="item" v-for="item in uiPaaSTag" :key="item.name" :style="item.position">
              {{ item.name }}
            </div>
          </div>

          <img class="main-pic" :src="`${genStaticPath('banner1_1650423019056.png')}`" alt="" />
          <div class="mask"></div>
        </div>

        <img class="sharing sharing1" :src="`${genStaticPath('shading1_1650423062181.png')}`" alt="" />
      </div>
      <img class="line1" :src="`${genStaticPath('line1_1650423232354.png')}`" alt="" />

      <div class="banner2 banner" :class="[opacityArr[1] && 'opacity']">
        <div class="main" @mouseenter="onMouseenter($event, 1)" @mouseleave="onMouseleave">
          <div class="tag-list iPaaS">
            <div class="item" v-for="item in iPaaSTag" :key="item.name" :style="item.position">
              {{ item.name }}
            </div>
          </div>
          <img class="main-pic" :src="`${genStaticPath('banner2_1650423250838.png')}`" alt="" />
          <div class="mask"></div>
        </div>
        <img class="sharing sharing2" :src="`${genStaticPath('shading2_1650423273229.png')}`" alt="" />
      </div>
      <img class="line2" :src="`${genStaticPath('line3_1650423296491.png')}`" alt="" />

      <div class="banner3 banner" :class="[opacityArr[2] && 'opacity']">
        <div class="main" @mouseenter="onMouseenter($event, 2)" @mouseleave="onMouseleave">
          <div class="tag-list hpaPaaSTag">
            <div class="item" v-for="item in hpaPaaSTag" :key="item.name" :style="item.position">
              {{ item.name }}
            </div>
          </div>

          <img class="main-pic" :src="`${genStaticPath('banner3_1650423322626.png')}`" alt="" />
          <div class="mask">
            <div class="mask-min"></div>
          </div>
        </div>
        <img class="sharing sharing3" :src="`${genStaticPath('shading3_1650423344107.png')}`" alt="" />
      </div>
      <img class="line3" :src="`${genStaticPath('line2_1650423361979.png')}`" alt="" />

      <div class="banner4 banner" :class="[opacityArr[3] && 'opacity']">
        <div class="main" @mouseenter="onMouseenter($event, 3)" @mouseleave="onMouseleave">
          <div class="tag-list aPaaSTag">
            <div class="item" v-for="item in aPaaSTag" :key="item.name" :style="item.position">
              {{ item.name }}
            </div>
          </div>
          <img class="main-pic" :src="`${genStaticPath('banner4_1650423381230.png')}`" alt="" />
          <div class="mask"></div>
        </div>
        <img class="sharing sharing4" :src="`${genStaticPath('shading4_1650423399349.png')}`" alt="" />
      </div>
      <img class="line4" :src="`${genStaticPath('line4_1650423416546.png')}`" alt="" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ref, computed } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';

interface Tag {
  name: string;
  value: string;
  position?: string;
}

export default defineComponent({
  props: ['dataList', 'title', 'genStaticPath'],
  setup(props) {
    const opacityArr = ref([false, false, false, false]);

    const onMouseenter = (e: MouseEvent, index: number) => {
      (e.target as HTMLElement).style.animationName = 'banner-ani-up';

      opacityArr.value = opacityArr.value.map((v, i) => {
        if (index === i) return v;

        return true;
      });
    };

    const onMouseleave = (e: MouseEvent) => {
      (e.target as HTMLElement).style.animationName = 'banner-ani-down';

      opacityArr.value = [false, false, false, false];
    };

    const filterTags = (list: any[]) => {
      return list
        .map((service: Tag) => {
          let position = '';
          if (service.position) {
            try {
              position = JSON.parse(service.position);
            } catch (err) {}
          }
          return {
            name: service.name + service.value + translateValueByKey('个'),
            position
          };
        })
        .filter((t: any) => t.position);
    };

    const iPaaSTag = computed(() => {
      const iPaaSList = props.dataList.iPaaSList || [];

      return filterTags(iPaaSList);
    });

    const hpaPaaSTag = computed(() => {
      const hpaPaaSList = props.dataList.hpaPaaSList || [];

      return filterTags(hpaPaaSList);
    });

    const aPaaSTag = computed(() => {
      const aPaaSList = props.dataList.aPaaSList || [];

      return filterTags(aPaaSList);
    });

    const uiPaaSTag = computed(() => {
      const uiPaaSList = props.dataList.uiPaaSList || [];

      return filterTags(uiPaaSList);
    });

    return {
      opacityArr,
      onMouseenter,
      onMouseleave,
      iPaaSTag,
      hpaPaaSTag,
      aPaaSTag,
      uiPaaSTag
    };
  }
});
</script>
<style lang="scss">
.tech-visualization {
  background: var(--oio-background);

  .tech-visualization-title {
    padding: 24px 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--oio-text-color);

    i {
      color: var(--oio-primary-color);
      font-size: 20px;
      margin-right: 5px;
    }
  }

  &.science {
    .title {
      height: 45px;
      font-family: PingFangSC-Medium;
      font-size: 32px;
      color: #2d343f;
      letter-spacing: 0;
      text-align: center;
      font-weight: 500;
      margin: 60px 0 72px 0;
    }

    .wrapper {
      width: 1100px;
      height: 690px;
      margin: 0 auto;
      text-align: center;
      position: relative;

      .line1 {
        position: absolute;
        left: 307.88px;
        top: 276px;
        width: 181px;
        z-index: 10;
      }
    }

    .banner1 {
      position: absolute;
      left: 308.55px;
      width: 549px;
      height: 372px;
      z-index: 10;
      cursor: pointer;

      .main-pic {
        width: 100%;
      }

      .sharing1 {
        position: absolute;
        width: 548.9px;
        height: 347.6px;
        left: 0px;
        top: 44.8px;
        z-index: -1;
      }

      .mask {
        width: 484px;
        height: 390px;
        left: 38px;
        top: -359px;
        position: relative;
        transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        border-radius: 60px;
      }
    }

    .banner2 {
      position: absolute;
      top: 104px;
      left: 0;
      width: 404px;
      height: 372px;
      cursor: pointer;

      .main-pic {
        width: 100%;
      }

      .sharing2 {
        position: absolute;
        width: 404px;
        left: 0px;
        top: 133px;
        z-index: -1;
      }

      .mask {
        width: 407px;
        height: 308px;
        left: -3px;
        top: -290.6px;
        position: relative;
        -webkit-transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        border-radius: 40px;
      }
    }

    .line2 {
      position: absolute;
      left: 53px;
      top: 403px;
      width: 425px;
      z-index: 10;
    }

    .banner3 {
      position: absolute;
      width: 498px;
      height: 344px;
      left: 335px;
      top: 323px;
      cursor: pointer;
      z-index: 9;

      .main-pic {
        width: 100%;
      }

      .sharing3 {
        position: absolute;
        width: 535.83px;
        height: 339.35px;
        left: -17.66px;
        top: 5px;
        z-index: -1;
      }

      .mask {
        width: 481px;
        height: 377px;
        left: 5px;
        top: -370px;
        position: relative;
        -webkit-transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        border-radius: 50px;
      }
    }

    .line3 {
      position: absolute;
      top: 408px;
      left: 725px;
      width: 328px;
      z-index: 11;
    }

    .banner4 {
      position: absolute;
      top: 192px;
      left: 722.6px;
      width: 376.34px;
      height: 323px;
      cursor: pointer;
      z-index: 11;

      .main-pic {
        width: 100%;
        z-index: 30;
      }

      .sharing4 {
        position: absolute;
        width: 373.67px;
        left: -0.3px;
        top: 63px;
        z-index: -1;
      }

      .mask {
        width: 333.34px;
        height: 254.71px;
        left: -3px;
        top: -290.6px;
        position: relative;
        -webkit-transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        transform: rotateX(304deg) rotateY(10deg) rotateZ(52deg);
        border-radius: 40px;
      }
    }

    .line4 {
      position: absolute;
      left: 653px;
      top: 266px;
      width: 205px;
      z-index: 10;
    }

    .banner {
      .main {
        height: 100%;
        animation-duration: 0.5s;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
        animation-fill-mode: forwards;
        overflow: inherit;
      }

      .main-pic {
        transform: translateZ(1000px);
        position: relative;
        z-index: 10;
        transition: all 0.5s cubic-bezier(0.23, 0.07, 0.13, 0.67);
      }

      .tag-list {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 12;
        transition: all 0.5s cubic-bezier(0.23, 0.07, 0.13, 0.67);
        transform: translateZ(1003px);

        .item {
          position: absolute;
        }

        &.iPaaS,
        &.hpaPaaSTag,
        &.uiPaaSTag,
        &.aPaaSTag {
          .item {
            line-height: 22px;
            background: rgba(0, 0, 0, 0.7);
            box-shadow: 0px 2px 4px 0px rgba(30, 62, 124, 0.15);
            border-radius: 2px;
            font-size: 12px;
            color: #ffffff;
            padding: 0 4px;
            transform: translateZ(103px);
            z-index: 10000;
            border-radius: 2px;
          }
        }

        &.uiPaaSTag {
          .item {
            background: rgba(4, 16, 93, 0.7);
          }
        }
      }

      .sharing {
        transition: all 0s cubic-bezier(0.23, 0.07, 0.13, 0.67);
      }

      .mask {
        background: #fff;
        z-index: 5;

        .mask-min {
          width: 80px;
          height: 100px;
          left: 460px;
          top: 240px;
          position: relative;
          border-radius: 20px;
          background-color: white;
        }
      }

      &.opacity {
        .main-pic {
          opacity: 0.5;
        }

        .tag-list {
          .item {
            opacity: 0.5;
          }
        }

        .sharing {
          opacity: 0.5;
        }
      }

      &:hover {
        z-index: 20;

        .main-pic {
          opacity: 1;
        }
      }
    }

    @keyframes banner-ani-up {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(-15px);
      }
    }

    @keyframes banner-ani-down {
      from {
        transform: translateY(-15px);
      }
      to {
        transform: translateY(0px);
      }
    }
  }
}
</style>

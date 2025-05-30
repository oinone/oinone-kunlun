<template>
  <div>
    <a-spin :spinning="spinning" size="large">
      <div class="apps-business-screen-container" id="apps-business-screen-container">
        <div class="container" style="background: var(--oio-body-background)" ref="node" v-if="appsData">
          <template v-for="item in appsData">
            <div class="oneLevelBusinessApps" v-if="item.code == AppCodeEnum.BUSINESS_GROWTH">
              <span class="innerOneLevelSpan">{{ item.name }}</span>
              <div class="boxContainer tow-box">
                <div class="twoSizeBox" v-for="(app, index) in item.children" :key="index">
                  <span class="innertwoLevelSpan">{{ app.name }}</span>
                  <for-card :executeAction="queryRelation" :cardsSize="2" :categoryModules="app.appModules"></for-card>
                </div>
              </div>
            </div>
            <div class="industryGeneralModel" v-else-if="item.code == AppCodeEnum.LOW_CODE_DESIGN">
              <span class="innerOneLevelSpan">{{ item.name }}</span>
              <div class="boxContainer">
                <div class="eightSizeBox" v-for="(app, index) in item.children" :key="index">
                  <span class="innertwoLevelSpan">{{ app.name }}</span>
                  <for-card :executeAction="queryRelation" :cardsSize="4" :categoryModules="app.appModules"></for-card>
                </div>
              </div>
            </div>
            <div class="industryGeneralModel" v-else-if="item.code == AppCodeEnum.INDUSTRY_GENERAL_MODEL">
              <span class="innerOneLevelSpan">{{ item.name }}</span>
              <div class="boxContainer">
                <div class="eightSizeBox threeEightSizeBox" v-for="(app, index) in item.children" :key="index">
                  <span class="innertwoLevelSpan">{{ app.name }}</span>
                  <for-card :executeAction="queryRelation" :cardsSize="8" :categoryModules="app.appModules"></for-card>
                </div>
              </div>
            </div>
            <div class="operationSupport" v-else-if="item.code == AppCodeEnum.OPERATION_SUPPORT">
              <span class="innerOneLevelSpan">{{ item.name }}</span>
              <div class="boxContainer">
                <div class="fourSizeBox fourEightSizeBox" v-for="(app, index) in item.children" :key="index">
                  <span class="innertwoLevelSpan">{{ app.name }}</span>
                  <for-card :executeAction="queryRelation" :cardsSize="4" :categoryModules="app.appModules"></for-card>
                </div>
              </div>
            </div>
            <div class="baseSupport" v-else>
              <span class="innerOneLevelSpan">{{ item.name }}</span>
              <div class="boxContainer tow-box">
                <div class="eightSizeBox2" v-for="(app, index) in item.children" :key="index">
                  <span class="innertwoLevelSpan">{{ app.name }}</span>
                  <for-card :executeAction="queryRelation" :cardsSize="4" :categoryModules="app.appModules"></for-card>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="full-page-action" @click="callFullPage">
          <i class="iconfont oinone-quanping"></i>
        </div>

        <relation-graph :module-relation="relationGraph" @click-card="executeAction" />
      </div>
    </a-spin>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import ForCard from './components/CardList.vue';
import RelationGraph from './components/RelationGraph.vue';

enum AppCodeEnum {
  BUSINESS_GROWTH = 'BUSINESS_GROWTH',
  LOW_CODE_DESIGN = 'LOW_CODE_DESIGN',
  INDUSTRY_GENERAL_MODEL = 'INDUSTRY_GENERAL_MODEL',
  OPERATION_SUPPORT = 'OPERATION_SUPPORT',
  BASE_SUPPORT = 'BASE_SUPPORT'
}

export default defineComponent({
  props: ['appsData', 'executeAction', 'queryModuleRelation'],

  components: {
    ForCard,
    RelationGraph
  },

  setup(props) {
    const oneLevelBusinessApps = ref([
      { name: translateValueByKey('运营') },
      { name: translateValueByKey('电商') },
      { name: translateValueByKey('分销') },
      { name: translateValueByKey('设计') }
    ]);
    const industryGeneralModel = ref([translateValueByKey('交易'), translateValueByKey('结算')]);
    const operationSupport = ref([translateValueByKey('业务分析'), translateValueByKey('流程自动化')]);
    const baseSupport = ref([
      translateValueByKey('集成'),
      translateValueByKey('翻译'),
      translateValueByKey('数据'),
      translateValueByKey('基础能力')
    ]);
    const flag1 = ref(true);
    const flag2 = ref(true);
    const flag3 = ref(true);
    const flag4 = ref(true);
    const relationGraph = ref<{ displayName: string; id: string; module: string; upRelation: string }>({} as any);

    const node = ref<HTMLElement>(null as any);

    const spinning = ref(false);

    const callFullPage = () => {
      const element = node.value as any;

      const requestMethod =
        element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullScreen;

      if (requestMethod) {
        requestMethod.call(element);
      } else if (typeof window.ActiveXObject !== 'undefined') {
        const wscript = new ActiveXObject('WScript.Shell');
        if (wscript !== null) {
          wscript.SendKeys('{F11}');
        }
      }
    };

    const queryRelation = async (record) => {
      if (record.state === 'INSTALLED') {
        spinning.value = true;
        relationGraph.value = await props.queryModuleRelation(record.module);
        spinning.value = false;
      } else {
        props.executeAction && props.executeAction(record);
      }
    };

    onMounted(() => {
      const script = document.createElement('script');
      script.src = 'https://gw.alipayobjects.com/os/lib/antv/g6/4.3.11/dist/g6.min.js';
      document.body.appendChild(script);
    });

    return {
      AppCodeEnum,
      oneLevelBusinessApps,
      industryGeneralModel,
      operationSupport,
      baseSupport,
      flag1,
      flag2,
      flag3,
      flag4,
      node,
      relationGraph,
      spinning,
      callFullPage,
      queryRelation
    };
  }
});
</script>

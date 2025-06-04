<template>
  <div class="card apps-business-screen-card" @click="clickExecuteAction(record)">
    <div class="application-content">
      <div
        class="application"
        :style="{
          'border-left-color': record.application ? 'var(--oio-primary-color)' : '#63A4FF'
        }"
      >
        <div class="application-text">
          <img style="width: 26px" :src="record.application ? appTag : moduleTag" alt="" />
        </div>
      </div>
    </div>
    <img class="logo" :src="record.logo || `${genStaticPath('default.png')}`" />
    <div class="info">
      <div class="title">{{ record.displayName }}</div>
      <div>
        <div v-if="record.state === 'INSTALLED'" class="state">{{ translateValueByKey('已安装') }}</div>
        <div v-if="record.state === 'UNINSTALLED'" class="state">{{ translateValueByKey('待安装') }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { genStaticPath, translateValueByKey } from '@oinone/kunlun-engine';

interface module {
  name: string;
  application: boolean;
  displayName: string;
  state: string;
}

export default defineComponent({
  props: {
    record: {
      type: Object as PropType<module>
    },
    executeAction: {
      type: Function as PropType<(value: any) => void>,
      required: true
    }
  },
  setup() {
    return {
      genStaticPath,
      translateValueByKey,
      appTag: `${genStaticPath('标签1_1651399484151.png')}`,
      moduleTag: `${genStaticPath('标签2_1651399538680.png')}`
    };
  },
  methods: {
    clickExecuteAction(data: any) {
      this.executeAction && this.executeAction(data);
    }
  }
});
</script>

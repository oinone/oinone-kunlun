<template>
  <div v-if="!!translateConfig" class="translate-settings-wrapper">
    <div class="oio-group oio-default-group">
      <div class="oio-group-title-wrapper">
        <div class="oio-group-title">{{ translateValueByKey('页面工具箱/添加翻译项、更改翻译项') }}</div>
      </div>
      <a-radio-group v-model:value="toolboxTranslation">
        <div class="common-layout-list">
          <div :class="['common-layout-item', toolboxTranslation ? 'active' : '']">
            <div class="common-layout-item-image" @click="() => onSaveConfig('toolboxTranslation', true)">
              <img :src="toolboxTranslationOpenImg" alt="" />
            </div>
            <a-radio style="color: var(--oio-text-color)" :value="true">{{ translateValueByKey('开启') }}</a-radio>
          </div>
          <div :class="['common-layout-item', toolboxTranslation ? '' : 'active']">
            <div class="common-layout-item-image" @click="() => onSaveConfig('toolboxTranslation', false)">
              <img :src="toolboxTranslationClosedImg" alt="" />
            </div>
            <a-radio style="color: var(--oio-text-color)" :value="false">{{ translateValueByKey('不开启') }}</a-radio>
          </div>
        </div>
      </a-radio-group>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineProps } from 'vue';
import { genStaticPath, translateValueByKey, TranslateSettingType } from '@oinone/kunlun-engine';

const toolboxTranslationOpenImg = genStaticPath('toolboxTranslationOpen.png?x-oss-process=image/resize,m_lfit,h_800');
const toolboxTranslationClosedImg = genStaticPath(
  'toolboxTranslationClosed.png?x-oss-process=image/resize,m_lfit,h_800'
);

const props = defineProps<{
  onSaveConfig: (index: string, value: boolean) => Promise<void>;
  goBack: () => void;
  translateConfig: TranslateSettingType;
}>();

const toolboxTranslation = computed({
  get: () => props.translateConfig.toolboxTranslation ?? false,
  set: (val) => {
    props.onSaveConfig('toolboxTranslation', val);
  }
});
</script>
<style lang="scss">
.translate-settings-wrapper {
  height: 100%;
  .oio-group-title {
    padding-left: 8px;
    border-left: solid var(--oio-primary-color) 2px;
  }
  .common-layout-list {
    padding: 16px;
    display: flex;
    gap: var(--oio-margin);
    .common-layout-item {
      text-align: center;
      .common-layout-item-image {
        cursor: pointer;
      }
      img {
        width: 218px;
        height: 122px;
        border: 1px solid var(--oio-border-color);
        border-radius: var(--oio-border-radius);
      }

      &.active {
        img {
          border-color: var(--oio-primary-color);
        }
      }
    }

    .ant-radio-wrapper {
      margin-top: var(--oio-margin);
    }
  }
}
</style>

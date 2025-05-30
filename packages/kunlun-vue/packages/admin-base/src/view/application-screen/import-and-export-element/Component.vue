<template>
  <div class="app-import-and-export-element" ref="nodeRef">
    <div
      class="app-import-and-export-element-modulename"
      v-if="moduleDisplayName"
      style="font-size: var(--oio-font-size-lg)"
    >
      {{ moduleDisplayName }}
    </div>
    <div
      class="app-import-and-export-element-default"
      :class="[tableWidgetLength <= 1 && 'oio-group oio-group-border']"
      :style="{
        padding: tableWidgetLength <= 1 ? '56px var(--oio-padding) var(--oio-padding) var(--oio-padding)' : 0
      }"
    >
      <slot name="default"></slot>
    </div>

    <div class="app-import-and-export-element-action">
      <div class="active-record-size">{{ tips }}</div>
      <div>
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { translateValueByKey, getUrlParamByKey } from '@kunlun/engine';
import { ModuleService } from '@kunlun/vue-admin-layout';
import { defineComponent, computed, ref, onMounted, nextTick } from 'vue';

export default defineComponent({
  props: {
    total: {
      type: Number,
      default: 0
    },
    tableWidgetLength: {
      type: Number,
      default: 1
    },
    selectedLength: { type: Number, default: 0 }
  },

  setup(props) {
    const context = getUrlParamByKey('context');
    const { module } = JSON.parse(decodeURIComponent(context));

    const moduleDisplayName = ref();
    const nodeRef = ref<HTMLElement>(null as any);
    const tableHeight = ref('300px');

    const tips = computed(
      () =>
        `${translateValueByKey('共')}${props.total}${translateValueByKey('条')}，${translateValueByKey('已选择')}${
          props.selectedLength
        }${translateValueByKey('条')}`
    );

    ModuleService.queryApplications().then((apps) => {
      const match = apps.find((app) => app.module === module);

      if (match) {
        moduleDisplayName.value = match.displayName;
      }
    });

    onMounted(async () => {
      await nextTick();
      const { height } = nodeRef.value.getBoundingClientRect();
      tableHeight.value = `${height - 210}px`;
    });

    return { tips, nodeRef, tableHeight, moduleDisplayName };
  }
});
</script>
<style lang="scss">
.app-import-and-export-element {
  height: 100%;
  position: relative;
  .ant-tabs-nav-wrap {
    padding-top: var(--oio-padding);
  }

  &-modulename {
    position: absolute;
    top: var(--oio-padding);
    left: var(--oio-padding);
    z-index: 10;
    color: var(--oio-text-color);
    font-weight: 500;
  }
  &-default {
    margin-bottom: calc(var(--oio-margin) * 2 + var(--oio-height));

    .default-table {
      height: v-bind(tableHeight) !important;
    }
  }
  &-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--oio-background);
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    z-index: 10;
    border-radius: var(--oio-border-radius) var(--oio-border-radius) 0 0;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.05);
    padding: var(--oio-padding);

    .active-record-size {
      color: var(-oio-text-color-secondary);
      margin-right: var(--oio-margin);
    }
  }
}
</style>

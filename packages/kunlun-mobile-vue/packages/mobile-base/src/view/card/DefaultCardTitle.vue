<template>
  <template v-if="visibleFieldList.length <= 1">
    <oio-col :span="24" v-for="(field, index) in visibleFieldList" :key="index">
      <default-gallery-item :label="field.field.label">
        <template #itemComponent>
          <slot :name="`cardTitle${field.field.name}`" />
        </template>
      </default-gallery-item>
    </oio-col>
  </template>
  <template v-else-if="visibleFieldList.length === 2">
    <oio-col :span="12" v-for="(field, index) in visibleFieldList" :key="index">
      <default-gallery-item :label="field.field.label">
        <template #itemComponent>
          <slot :name="`cardTitle${field.field.name}`" />
        </template>
      </default-gallery-item>
    </oio-col>
  </template>
  <template v-else>
    <oio-col :span="8">
      <default-gallery-item :label="visibleFieldList[0].field.label">
        <template #itemComponent>
          <slot :name="`cardTitle${visibleFieldList[0].field.name}`" />
        </template>
      </default-gallery-item>
    </oio-col>
    <oio-col :span="8" :class="`${DEFAULT_PREFIX}-scrollbar ${DEFAULT_PREFIX}-default-card-title-scrollbar`">
      <oio-row>
        <template v-for="(field, index) in visibleFieldList" :key="index">
          <oio-col :span="24" v-if="index > 0 && index < visibleFieldList.length - 1">
            <default-gallery-item :label="field.field.label">
              <template #itemComponent>
                <slot :name="`cardTitle${field.field.name}`" />
              </template>
            </default-gallery-item>
          </oio-col>
        </template>
      </oio-row>
    </oio-col>
    <oio-col :span="8">
      <default-gallery-item :label="visibleFieldList[visibleFieldList.length - 1].field.label">
        <template #itemComponent>
          <slot :name="`cardTitle${visibleFieldList[visibleFieldList.length - 1].field.name}`" />
        </template>
      </default-gallery-item>
    </oio-col>
  </template>
</template>
<script lang="ts">
import { DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { defineComponent, PropType } from 'vue';
import { OioCol, OioRow, DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { DefaultGalleryItem } from '../../basic';
import { DetailCommonFieldWidget } from '../../field';

export default defineComponent({
  name: 'DefaultCardTitle',
  components: { OioCol, OioRow, DefaultGalleryItem },
  inheritAttrs: false,
  props: {
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    visibleFieldList: Array as PropType<DetailCommonFieldWidget[]>,
    firstVisibleField: Object as PropType<DetailCommonFieldWidget>,
    lastVisibleField: Object as PropType<DetailCommonFieldWidget>
  },
  setup() {
    return { DEFAULT_PREFIX };
  }
});
</script>

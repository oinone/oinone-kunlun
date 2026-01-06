<template>
  <detail-common-field class="default-map" :is-empty="isEmpty">
    <div v-for="item in items" :key="item.name" class="default-map-item default-map-item-readonly">
      <span class="default-map-item-name-readonly">{{ item.name || '' }}</span>
      <span class="default-map-item-separator">{{ ': ' }}</span>
      <span class="default-map-item-value-readonly">{{ item.value || '' }}</span>
    </div>
  </detail-common-field>
</template>
<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import type { MapItem } from '../../form/map/typing';
import { DetailCommonField } from '../common';

export default defineComponent({
  name: 'DefaultReadonlyMap',
  components: { DetailCommonField },
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<MapItem[]>,
      default: () => []
    }
  },
  setup(props) {
    const isEmpty = computed(() => !props.items?.length);

    return {
      isEmpty
    };
  }
});
</script>

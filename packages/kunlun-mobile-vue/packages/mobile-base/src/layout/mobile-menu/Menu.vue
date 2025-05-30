<template>
  <div class="menu-wrapper">
    <div class="menu-list">
      <div class="menu-item" :style="style" v-for="(item, index) in treeNodes" :key="item.key">
        <div
          class="menu-item-wrapper"
          :class="[
            hasOpen(item.value.id) && 'menu-item-wrapper-selected',
            activeMenuId == item.value.id && item.value.viewAction && 'menu-view-action menu-item-wrapper-selected'
          ]"
          @click="onOpen(item)"
        >
          <div class="menu-title">
            <div class="menu-title-icon" v-if="depth === 0">
              <oio-icon :icon="item.value.icon || 'oinone-yijicaidan'" color="rgba(0, 0, 0, 0.25)" size="16" />
            </div>
            <div class="menu-title-name">{{ item.value.displayName }}</div>
          </div>
          <div class="menu-arrow">
            <icon
              name="arrow"
              v-if="item.children && item.children.length"
              :class="[hasOpen(item.value.id) && 'arrow-selected', 'menu-arrow-icon']"
            />
          </div>
        </div>
        <oio-menu
          v-if="item.children && item.children.length"
          :active-menu-id="activeMenuId"
          :menus="menus"
          :treeNodes="item.children"
          :depth="(depth || 0) + 1"
          :expand="expand"
          :open-keys="openKeys"
          :parent-menu-path="[...parentMenuPath, item.value.name]"
          :style="{
            maxHeight: hasOpen(item.value.id) ? '1000px' : '0'
          }"
          @selected="subOpen"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { OioIcon } from '@kunlun/vue-ui-common';
import { Icon } from 'vant';

export default defineComponent({
  name: 'OioMenu',
  props: {
    menus: Array,
    treeNodes: Array,
    expand: Boolean,
    activeMenuId: {
      type: [String, Number]
    },
    depth: {
      type: Number,
      default: 0
    },
    parentMenuPath: {
      type: Array,
      default: () => []
    },
    openKeys: {
      type: Array,
      default: () => []
    }
  },
  components: {
    Icon,
    OioIcon
  },
  emits: ['selected'],
  setup(props, { emit }) {
    const style = computed(() => ({ 'padding-left': `${((props.depth || 0) + 0) * 14}px` }));
    const active = ref<string[]>([]);
    const secondActiveId = ref(null);

    const hasOpen = (id) => {
      return active.value.includes(id) || props.expand;
    };

    onMounted(() => {
      if (props.openKeys.length) {
        const value = props.menus?.filter((m: any) => props.openKeys.includes(m.name)).map((m: any) => m.id);
        active.value = value || [];
      }
    });

    const onOpen = (item) => {
      const id = item.value.id;
      if (!(item.children && item.children.length)) {
        emit('selected', {
          menu: item.value,
          parentMenuPath: props.parentMenuPath
        });
      }
      if (active.value?.includes(id)) {
        const idx = active.value.findIndex((a) => a === id);
        active.value.splice(idx, 1);
      } else {
        active.value.push(id);
      }
    };

    function subOpen(cond) {
      emit('selected', cond);
      secondActiveId.value = cond.menuId;
    }

    return { active, secondActiveId, style, onOpen, subOpen, hasOpen };
  }
});
</script>

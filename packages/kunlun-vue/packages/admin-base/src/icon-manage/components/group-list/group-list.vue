<template>
  <div class="group-list-component">
    <draggable
      tag="div"
      :animation="200"
      v-model="groupList"
      handle=".group-list-component-item-move-box"
      item-key="name"
      @change="onSortGroup"
    >
      <template #item="{ element, index }">
        <group-item
          :item="element"
          @delete="$emit('delete', element.id)"
          @update-display-name="$emit('update-display-name', element)"
        ></group-item>
      </template>
    </draggable>
  </div>
</template>
<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import draggable from 'vuedraggable';
import GroupItem from './group-item.vue';
import { ComGroupService } from '../../service';

export default defineComponent({
  components: {
    draggable,
    GroupItem
  },
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const groupList = ref<any[]>([]);

    watch(
      () => props.list,
      (list) => {
        groupList.value = list.filter((l: any) => l.name !== 'VIRTUAL_ALL');
      },
      { deep: true, immediate: true }
    );

    const onSortGroup = () => {
      const virtualAll = props.list[0];

      ComGroupService.sort([virtualAll, ...groupList.value]);
    };

    return { onSortGroup, groupList };
  }
});
</script>

<template>
  <div class="work-scope-field-widget">
    <a-tree
      class="oio-tree"
      default-expand-all
      checkable
      :tree-data="treeData"
      :checked-keys="currentValue"
      @check="onCheck"
    >
    </a-tree>
  </div>
</template>
<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import { Tree as ATree } from 'ant-design-vue';
import { computed, defineComponent, ref } from 'vue';
import { queryOpenInterface, queryWorkScope } from './service';

export default defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: Array,
      default: () => []
    },

    change: {
      type: Function,
      default: () => {}
    }
  },
  components: { ATree },
  setup(props) {
    const emptyGroupName = '$$empty_group';
    const treeData = ref<any[]>([]);

    const currentValue = computed(() => {
      return (props.value || []).map((v: any) => v.interfaceName);
    });

    const init = async () => {
      const workScopes = await queryWorkScope();
      treeData.value = workScopes.map((v) => ({
        ...v,
        key: v.code,
        title: v.name
      }));

      const openInterface = await queryOpenInterface();

      openInterface.forEach((item) => {
        const pIndex = treeData.value.findIndex((t) => t.code === item.connGroupCode);

        const child = {
          ...item,
          key: item.interfaceName,
          title: item.name
        };

        if (pIndex >= 0) {
          if (!treeData.value[pIndex].children) {
            treeData.value[pIndex].children = [];
          }

          treeData.value[pIndex].children.push(child);
        } else {
          const existEmptyGroup = treeData.value.some((t) => t.name === emptyGroupName);
          if (!existEmptyGroup) {
            treeData.value.push({
              children: [child],
              key: emptyGroupName,
              title: translateValueByKey('未设置业务域')
            });
          } else {
            const index = treeData.value.findIndex((t) => t.name === emptyGroupName);

            index >= 0 && treeData.value[index].children.push(child);
          }
        }
      });

      treeData.value = treeData.value.filter((v) => v.children && v.children.length);
    };

    init();

    const onCheck = (val) => {
      const value = val.filter((v) => !treeData.value.find((t) => t.code === v)).map((v) => ({ interfaceName: v }));
      props.change(value);
    };

    return { currentValue, treeData, onCheck };
  }
});
</script>
<style lang="scss">
.work-scope-field-widget {
  padding: calc(var(--oio-padding) - 4px) calc(var(--oio-padding) - 8px) calc(var(--oio-padding) - 4px)
    calc(var(--oio-padding) - 8px);
  background: rgba(3, 93, 255, 0.05);
  border: 1px solid #035bff0e;
  border-radius: 4px;
  margin-bottom: var(--oio-margin);

  .ant-tree {
    background: transparent;

    .ant-tree-checkbox-indeterminate .ant-tree-checkbox-inner:after {
      background-color: var(--oio-primary-color);
    }

    .ant-tree-switcher {
      color: var(--oio-icon-color);
    }
  }
}
</style>

<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, type PropType, type VNode } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    viewControlWidget: {
      type: Object as PropType<DslDefinition>
    }
  },
  render() {
    const { viewControlWidget } = this;
    const children: VNode[] = [];
    for (const widget of viewControlWidget?.widgets || []) {
      const target = DslRender.render(widget);
      if (target) {
        children.push(target);
      }
    }
    return createVNode(
      'div',
      {
        class: 'default-view-control-icon'
      },
      children
    );
  }
});
</script>
<style lang="scss">
.default-view-control-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .default-view-control-item {
    .oio-icon {
      cursor: pointer;
      padding: var(--oio-padding-sm);
      border-radius: var(--oio-border-radius);

      &:hover {
        background: var(--oio-hover-background-color);
        color: var(--oio-hover-text-color);
      }
    }
  }
}

.default-view-control-popover {
  width: 400px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
  border-radius: var(--oio-border-radius);
  padding: 0;

  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>

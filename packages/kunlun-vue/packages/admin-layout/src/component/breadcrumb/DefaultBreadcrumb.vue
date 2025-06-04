<script lang="ts">
import { IMenu } from '@oinone/kunlun-meta';
import { Breadcrumb as ABreadcrumb, BreadcrumbItem as ABreadcrumbItem } from 'ant-design-vue';
import { createVNode, defineComponent, PropType, VNode } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';

export default defineComponent({
  name: 'DefaultBreadcrumb',
  components: {
    ABreadcrumb,
    ABreadcrumbItem
  },
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<IMenu[]>
    },
    enabledHomepage: {
      type: Boolean,
      default: undefined
    },
    model: {
      type: String
    },
    action: {
      type: String
    },
    currentViewTitle: {
      type: String
    },
    translate: {
      type: Function
    },
    executeAction: {
      type: Function
    },
    onHomepage: {
      type: Function
    }
  },
  render() {
    if (!this.items?.length) {
      return [];
    }
    const children: VNode[] = [];
    const breadcrumbChildren: VNode[] = [];
    if (this.enabledHomepage) {
      breadcrumbChildren.push(
        createVNode(
          ABreadcrumbItem,
          {},
          {
            default: () => [
              createVNode(
                'span',
                {
                  class: 'breadcrumb-allow-click',
                  onClick: () => this.onHomepage?.()
                },
                this.translate?.('kunlun.breadcrumbs.index')
              )
            ]
          }
        )
      );
    }
    this.items.forEach((item, index) => {
      let content: string | VNode[];
      const { viewAction } = item;
      if (!viewAction || (viewAction.model === this.model && viewAction.name === this.action)) {
        content = item.displayName;
      } else {
        content = [
          createVNode(
            'span',
            {
              class: 'breadcrumb-allow-click',
              onClick: () => this.executeAction?.(viewAction, index)
            },
            item.displayName
          )
        ];
      }
      breadcrumbChildren.push(createVNode(ABreadcrumbItem, { key: index }, { default: () => content }));
    });
    if (this.currentViewTitle) {
      breadcrumbChildren.push(
        createVNode(ABreadcrumbItem, {}, { default: () => translateValueByKey(this.currentViewTitle) })
      );
    }
    children.push(createVNode(ABreadcrumb, {}, { default: () => breadcrumbChildren }));
    return createVNode('div', { class: 'k-tool-bread' }, children);
  }
});
</script>

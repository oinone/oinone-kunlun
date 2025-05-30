<script lang="ts">
import { isNil } from 'lodash-es';
import { createVNode, defineComponent, VNode } from 'vue';
import { useClick } from '../../quick-utils';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper } from '../../util';
import { isComment } from '../../util/vnode/util';
import { OioCardProps } from './props';

export default defineComponent({
  name: 'OioCard',
  inheritAttrs: false,
  props: {
    ...OioCardProps
  },
  slots: ['default', 'title', 'titleToolbar', 'toolbar'],
  setup(props, context) {
    const onClick = (...args) => {
      (context.attrs.onClick as Function)?.(...args);
    };

    const { onMousedown, onMouseup } = useClick(onClick);

    return {
      onMousedown,
      onMouseup
    };
  },
  render() {
    const { onMousedown, onMouseup } = this;
    const classList = [`${DEFAULT_PREFIX}-card`];
    if (!!this.$attrs.onClick) {
      classList.push(`${DEFAULT_PREFIX}-card-allow-click`);
    }
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      'title',
      'titleToolbar',
      'toolbar'
    ]);
    const children: VNode[] = [];
    let titleChildren: VNode | VNode[] | undefined;
    if (slots.title) {
      titleChildren = slots.title();
    } else if (!isNil(this.title)) {
      titleChildren = [
        createVNode(
          'div',
          {
            class: `${DEFAULT_PREFIX}-card-title-wrapper`
          },
          [
            createVNode(
              'span',
              {
                title: this.title
              },
              this.title
            )
          ]
        )
      ];
    }
    if (titleChildren) {
      children.push(
        createVNode('div', { class: `${DEFAULT_PREFIX}-card-title`, onMousedown, onMouseup }, titleChildren)
      );
    } else {
      classList.push(`${DEFAULT_PREFIX}-card-no-title`);
    }
    if (slots.titleToolbar) {
      children.push(createVNode('div', { class: `${DEFAULT_PREFIX}-card-title-toolbar` }, slots.titleToolbar()));
    }
    children.push(
      createVNode('div', { class: `${DEFAULT_PREFIX}-card-content`, onMousedown, onMouseup }, slots.default())
    );
    if (slots.toolbar) {
      const finalToolbarItems: VNode[] = [];
      const toolbarItems = slots.toolbar();
      toolbarItems
        .filter((v) => !isComment(v))
        .forEach((value, index) => {
          if (index !== 0) {
            finalToolbarItems.push(createVNode('span', { class: `${DEFAULT_PREFIX}-card-toolbar-divider` }));
          }
          finalToolbarItems.push(value);
        });
      children.push(createVNode('div', { class: `${DEFAULT_PREFIX}-card-toolbar` }, finalToolbarItems));
    }
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classList),
        onClick: undefined
      },
      children
    );
  }
});
</script>

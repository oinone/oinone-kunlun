<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import { OioGroupProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import OioGroupHelp from './oio-group-help.vue';

export default defineComponent({
  name: 'OioGroup',
  inheritAttrs: false,
  props: {
    ...OioGroupProps
  },
  slots: ['default', 'title', 'titleToolbar'],
  render() {
    const {
      $attrs,
      $slots,
      title,
      description,
      border,
      wrapperClassName,
      wrapperStyle,
      help,
      helpIcon,
      helpIconSize,
      helpIconColor,
      helpPlacement,
      helpBgColor,
      helpAdjustOverflow
    } = this;
    const slots = PropRecordHelper.collectionSlots($slots, [
      { origin: 'default', isNotNull: true },
      'title',
      'titleToolbar'
    ]);
    const mainClassName = `${DEFAULT_PREFIX}-group`;
    const classList = [mainClassName];
    if (border) {
      classList.push(`${mainClassName}-border`);
    }
    let hiddenTitle = title === false;
    let titleVNodes: VNode[] | undefined;
    if (slots.title) {
      titleVNodes = slots.title();
    } else if (title) {
      titleVNodes = [
        createVNode(
          'div',
          {
            class: `${mainClassName}-title`,
            title
          },
          title
        )
      ];
    } else {
      hiddenTitle = true;
    }
    if (hiddenTitle) {
      classList.push(`${mainClassName}-title-hidden`);
    }
    if (titleVNodes) {
      const titleClassList = [`${mainClassName}-title-wrapper`];
      if (help) {
        titleVNodes.push(
          createVNode(OioGroupHelp, {
            help,
            helpIcon,
            helpIconSize,
            helpIconColor,
            helpPlacement,
            helpBgColor,
            helpAdjustOverflow
          })
        );
      }
      if (description) {
        titleVNodes.push(
          createVNode(
            'div',
            {
              class: `${mainClassName}-description`,
              title: description
            },
            description
          )
        );
      }
      if (slots.titleToolbar) {
        titleVNodes = [createVNode('div', { class: `${mainClassName}-title-content` }, titleVNodes)];
        titleVNodes.push(
          createVNode(
            'div',
            {
              class: `${mainClassName}-title-toolbar`
            },
            slots.titleToolbar()
          )
        );
        titleClassList.push(`${mainClassName}-title-space-between`);
      }
      titleVNodes = [createVNode('div', { class: titleClassList }, titleVNodes)];
    }
    const a = createVNode('div', PropRecordHelper.collectionBasicProps($attrs, classList), [
      ...(titleVNodes || []),
      createVNode(
        'div',
        {
          class: StringHelper.append([`${mainClassName}-content`], wrapperClassName),
          style: wrapperStyle
        },
        slots.default()
      )
    ]);
    // console.log('xccccvc.1', a);
    // console.log('xccccvc.2', slots.default());
    // console.log('xccccvc.3', titleVNodes);
    return a;
  }
});
</script>

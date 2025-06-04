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
      toolbarClassName,
      toolbarStyle,
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
    const classList = [`${DEFAULT_PREFIX}-group`];
    if (border) {
      classList.push(`${DEFAULT_PREFIX}-group-border`);
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
            key: `${DEFAULT_PREFIX}-group-title`,
            class: `${DEFAULT_PREFIX}-group-title`,
            title
          },
          title
        )
      ];
    }
    if (titleVNodes) {
      const titleClassList = [`${DEFAULT_PREFIX}-group-title-wrapper`];
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
              key: `${DEFAULT_PREFIX}-group-description`,
              class: `${DEFAULT_PREFIX}-group-description`,
              title: description
            },
            description
          )
        );
      }
      if (slots.titleToolbar) {
        titleVNodes = [createVNode('div', { class: `${DEFAULT_PREFIX}-group-title-content` }, titleVNodes)];
        titleVNodes.push(
          createVNode(
            'div',
            {
              class: StringHelper.append([`${DEFAULT_PREFIX}-group-title-toolbar`], toolbarClassName),
              style: toolbarStyle
            },
            slots.titleToolbar()
          )
        );
        titleClassList.push(`${DEFAULT_PREFIX}-group-title-space-between`);
      }
      titleVNodes = [createVNode('div', { class: titleClassList }, titleVNodes)];
    } else if (slots.titleToolbar) {
      const titleClassList = [`${DEFAULT_PREFIX}-group-title-wrapper`];
      titleVNodes = [
        createVNode(
          'div',
          {
            class: StringHelper.append([`${DEFAULT_PREFIX}-group-title-toolbar`], toolbarClassName),
            style: toolbarStyle
          },
          slots.titleToolbar()
        )
      ];
      titleClassList.push(`${DEFAULT_PREFIX}-group-title-flex-end`);
      titleVNodes = [createVNode('div', { class: titleClassList }, titleVNodes)];
    } else {
      hiddenTitle = true;
    }
    if (hiddenTitle) {
      classList.push(`${DEFAULT_PREFIX}-group-title-hidden`);
    }
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, classList), [
      ...(titleVNodes || []),
      createVNode(
        'div',
        {
          key: `${DEFAULT_PREFIX}-group-content`,
          class: StringHelper.append(
            [`${DEFAULT_PREFIX}-group-content`, `${DEFAULT_PREFIX}-scrollbar`],
            wrapperClassName
          ),
          style: wrapperStyle
        },
        slots.default()
      )
    ]);
  }
});
</script>

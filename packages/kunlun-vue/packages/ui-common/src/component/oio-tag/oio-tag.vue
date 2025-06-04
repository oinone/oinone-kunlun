<script lang="ts">
import { CSSStyle } from '@oinone/kunlun-shared';
import { createVNode, defineComponent, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper } from '../../util';
import { getVNodeKey } from '../../util/vnode/util';
import { OioIcon } from '../oio-icon';
import { OioTagCheckedEvent, OioTagClosedEvent } from './event';
import { OioTagProps } from './props';

export default defineComponent({
  name: 'OioTag',
  inheritAttrs: false,
  props: {
    ...OioTagProps
  },
  slots: ['default'],
  emits: ['update:checked', 'checked', 'closed'],
  setup(props, context) {
    const key = getVNodeKey() || 'undefined';

    const onChecked = (e: PointerEvent) => {
      const event: OioTagCheckedEvent = {
        originEvent: e,
        key
      };
      context.emit('checked', event);
      context.emit('update:checked', true);
    };

    const onClosed = (e: PointerEvent) => {
      const event: OioTagClosedEvent = {
        originEvent: e,
        key
      };
      context.emit('closed', event);
    };

    return {
      onChecked,
      onClosed
    };
  },
  render() {
    const { $attrs, color, backgroundColor, icon, allowChecked, checked, closable, onChecked, onClosed } = this;
    const { default: defaultSlot, closeIcon: closeIconSlot } = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      'closeIcon'
    ]);
    const style = {} as CSSStyle;
    style[`--${DEFAULT_PREFIX}-tag-color`] = color;
    style[`--${DEFAULT_PREFIX}-tag-background-color`] = backgroundColor;
    const classNames: string[] = [`${DEFAULT_PREFIX}-tag`];
    if (allowChecked) {
      classNames.push(`${DEFAULT_PREFIX}-tag-allow-checked`);
    }
    if (checked) {
      classNames.push(`${DEFAULT_PREFIX}-tag-checked`);
    }
    const componentProps = PropRecordHelper.collectionBasicProps($attrs, classNames, style);
    if (allowChecked) {
      componentProps.onClick = onChecked;
    }
    let children: VNode[] = [];
    if (icon) {
      children.push(createVNode(OioIcon, { icon }));
    }
    children = [...children, ...defaultSlot()];
    if (closable) {
      let closeableChildren: VNode[];
      if (closeIconSlot) {
        closeableChildren = closeIconSlot();
      } else {
        closeableChildren = [createVNode(OioIcon, { icon: 'oinone-guanbi1' })];
      }
      children.push(
        createVNode('div', { class: `${DEFAULT_PREFIX}-tag-closable`, onClick: onClosed }, closeableChildren)
      );
    }
    return createVNode('span', componentProps, children);
  }
});
</script>

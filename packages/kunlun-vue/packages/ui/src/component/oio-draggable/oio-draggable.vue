<script lang="ts">
import { CastHelper, DomHelper, Optional, StringHelper } from '@kunlun/shared';
import { StyleHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent, ref, VNode, VNodeProps } from 'vue';
import draggable from 'vuedraggable';
import { EndEvent, GhostBody, MoveBody, StartEvent } from './draggable-types';
import { DraggableEndEvent, DraggableSendEvent, DraggableStartEvent } from './event';
import { OioDraggableProps } from './props';
import { fetchOioDraggableComponent, getUnderlyingPotencialDraggableComponent, isTransition, skipVNode } from './util';

export default defineComponent({
  name: 'OioDraggable',
  components: {
    draggable
  },
  inheritAttrs: false,
  props: {
    ...OioDraggableProps
  },
  emits: ['change'],
  setup(props, { emit }) {
    const origin = ref();
    const ghostBody = ref<GhostBody | undefined>();
    const currentMoveBody = ref<MoveBody | undefined>();

    const move = (sendEvent: DraggableSendEvent, originalEvent: DragEvent) => {
      const dom = originalEvent.target as HTMLElement;
      const currentClientRect = DomHelper.getClientRect(dom);
      const moveBody = currentMoveBody.value;
      if (moveBody) {
        if (DomHelper.clientRectEquals(moveBody.clientRect, currentClientRect)) {
          return moveBody.result;
        }
      }
      let result: boolean | number | undefined | void;
      if (sendEvent.from === sendEvent.to) {
        result = props.moveToSelfCallback?.(sendEvent, originalEvent);
      } else if (
        Optional.ofNullable(fetchOioDraggableComponent(sendEvent))
          .map((v) => v.disableAdd)
          .orElse(false)
      ) {
        result = false;
      } else {
        result = props.moveToOtherCallback?.(sendEvent, originalEvent);
      }
      if (result === false) {
        if (ghostBody.value) {
          ghostBody.value = undefined;
        }
      } else {
        ghostBody.value = {
          sendEvent,
          originalEvent
        };
      }
      currentMoveBody.value = {
        dom,
        clientRect: currentClientRect,
        result
      };
      return result;
    };

    const resetCurrentContext = () => {
      currentMoveBody.value = undefined;
    };

    const onStart = (event: StartEvent) => {
      resetCurrentContext();
      const startCallback = props.startCallback;
      if (!startCallback) {
        return;
      }
      const { oldIndex } = event;
      Optional.ofNullable(props.list)
        .map((v) => v![oldIndex])
        .ifPresent((v) => {
          startCallback({
            element: v,
            index: oldIndex
          } as DraggableStartEvent);
        });
    };

    const onEnd = (event: EndEvent) => {
      resetCurrentContext();
      const endCallback = props.endCallback;
      if (!endCallback) {
        return;
      }
      const { oldIndex, newIndex, from, to } = event;
      Optional.ofNullable(props.list)
        .map((v) => v![oldIndex])
        .ifPresent((v) => {
          endCallback({
            fromComponent: getUnderlyingPotencialDraggableComponent(from),
            oldElement: v,
            oldIndex,
            toComponent: getUnderlyingPotencialDraggableComponent(to),
            newIndex
          } as DraggableEndEvent);
        });
    };

    const onChange = (e) => {
      const { added, moved, removed } = e;
      if (added && props.addedCallback) {
        props.addedCallback({
          ...added,
          component: origin.value?.$parent
        });
      }
      if (moved && props.movedCallback) {
        props.movedCallback({
          ...moved,
          component: origin.value?.$parent
        });
      }
      if (removed && props.removedCallback) {
        props.removedCallback({
          ...removed,
          component: origin.value?.$parent
        });
      }
      emit('change', e);
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return {
      origin,
      move,
      onStart,
      onEnd,
      onChange,
      onDrop
    };
  },
  render() {
    const { list, $slots } = this;
    const { item } = $slots;
    if (list && item) {
      const [header, footer] = ['header', 'footer'].map((name) => {
        const slot = $slots[name];
        return slot || (() => []);
      });
      const itemNodes: VNode[][] = [];
      list.forEach((element, index) => {
        let isPush = true;
        if (this.filter) {
          isPush = this.filter(element, index);
        }
        if (isPush) {
          itemNodes.push(
            item(
              Optional.ofNullable(this.mapper)
                .map((v) => v!({ element, index }))
                .orElse({ element, index })
            ).map((v) => skipVNode(v)) as VNode[]
          );
        }
      });
      const componentData = this.componentData || {};
      const componentClass = StringHelper.append(
        [],
        CastHelper.cast(componentData.class),
        CastHelper.cast(this.$attrs.class)
      );
      const componentStyle = {
        ...(StyleHelper.parse(CastHelper.cast(componentData.style)) || {}),
        ...(StyleHelper.parse(CastHelper.cast(this.$attrs.style)) || {})
      };
      componentData.class = componentClass;
      componentData.style = componentStyle;
      const draggableProps: Record<string, unknown> & VNodeProps = {
        ...this.$attrs,
        list,
        itemKey: this.itemKey,
        group: this.group,
        clone: this.clone,
        tag: this.tag,
        componentData,
        sort: this.sort,
        direction: this.direction,
        swapThreshold: this.swapThreshold,
        invertSwap: this.invertSwap,
        invertedSwapThreshold: this.invertedSwapThreshold,
        animation: this.animation,
        disabled: this.disabled,
        move: this.move,
        onStart: this.onStart,
        onEnd: this.onEnd,
        onChange: this.onChange,
        dragoverBubble: false,
        filter: this.draggableFilter,
        ref: 'origin',
        class: componentClass,
        style: componentStyle
      };
      if (!isTransition(this.tag)) {
        draggableProps.onDrop = this.onDrop;
      }
      return createVNode(draggable, draggableProps, {
        header,
        footer,
        item: ({ index }: { index: number }) => itemNodes[index]
      });
    }
    return createVNode('div');
  }
});
</script>

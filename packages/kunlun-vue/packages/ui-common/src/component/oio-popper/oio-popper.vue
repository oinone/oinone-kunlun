<script lang="ts">
import { StringHelper } from '@kunlun/shared';
import { computed, createVNode, defineComponent, Fragment, ref, SetupContext, Teleport, VNode, VNodeProps } from 'vue';
import { PropRecordHelper } from '../../util';
import { OioPopperProps } from './props';
import { DEFAULT_SLOT_NAME, renderPopper, renderTrigger, TRIGGER_SLOT_NAME } from './renders';
import usePopper from './use-popper';
import { EmitType } from './use-popper/typing';

const component = 'OioPopper';

export default defineComponent({
  name: component,
  props: {
    ...OioPopperProps
  },
  slots: [DEFAULT_SLOT_NAME, TRIGGER_SLOT_NAME],
  setup(props, context: SetupContext<EmitType[]>) {
    const triggerOrigin = ref<HTMLElement>();

    const triggerContainer = computed<HTMLElement>(() => {
      const triggerNode = triggerOrigin.value;
      if (triggerNode) {
        if (props.getTriggerContainer) {
          return props.getTriggerContainer(triggerNode);
        }
      }
      return document.body;
    });

    const getTriggerInfo = () => {
      const triggerHTMLElement = triggerOrigin.value;
      if (!triggerHTMLElement) {
        return {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: 0,
          height: 0,
          screenWidth: 0,
          screenHeight: 0,
          scrollTop: 0,
          scrollLeft: 0
        };
      }
      const triggerClientRect = triggerHTMLElement.getBoundingClientRect();
      const containerClientRect = triggerContainer.value.getBoundingClientRect();
      return {
        top: triggerClientRect.top - containerClientRect.top,
        right: containerClientRect.right - triggerClientRect.right,
        bottom: containerClientRect.bottom - triggerClientRect.bottom,
        left: triggerClientRect.left - containerClientRect.left,
        width: triggerHTMLElement.clientWidth,
        height: triggerHTMLElement.clientHeight,
        screenWidth: triggerContainer.value.clientWidth,
        screenHeight: triggerContainer.value.clientHeight,
        scrollTop: triggerContainer.value.scrollTop,
        scrollLeft: triggerContainer.value.scrollLeft
      };
    };

    return {
      triggerOrigin,
      getTriggerInfo,
      triggerContainer,
      ...usePopper(props, context)
    };
  },
  render() {
    const slots = PropRecordHelper.collectionSlots(this.$slots, [DEFAULT_SLOT_NAME, TRIGGER_SLOT_NAME]);
    const defaultSlot = slots.default;
    const triggerSlot = slots.trigger;
    if (!defaultSlot) {
      throw new Error(`${DEFAULT_SLOT_NAME} Slot must be provided`);
    }
    if (!triggerSlot) {
      throw new Error(`${TRIGGER_SLOT_NAME} Slot must be provided`);
    }
    const triggerProps = {
      ref: 'triggerOrigin',
      ...this.events
    };
    const children: VNode[] = [renderTrigger(slots, triggerProps)];
    if (this.visibility || (!this.visibility && !this.destroyOnHide)) {
      children.push(
        createVNode(
          Teleport as VNodeProps,
          {
            to: this.triggerContainer
          },
          [
            renderPopper(slots, {
              triggerInfo: this.getTriggerInfo(),
              relative: this.relative,
              relativePosition: this.relativePosition,
              offsetPosition: this.offsetPosition,
              name: this.popperTransition,
              class: StringHelper.append(['oio-popper'], this.popperClass),
              style: this.popperStyle || ({} as CSSStyleDeclaration),
              visibility: this.visibility,
              onMouseenter: this.onPopperMouseenter,
              onMouseleave: this.onPopperMouseleave,
              onBeforeEnter: this.onBeforeEnter,
              onAfterEnter: this.onAfterEnter,
              onBeforeLeave: this.onBeforeLeave,
              onAfterLeave: this.onAfterLeave
            })
          ]
        )
      );
    }
    return createVNode(Fragment, undefined, children);
  }
});
</script>

import { isNil } from 'lodash-es';
import { createVNode, Slot, Transition, VNode, vShow, withDirectives } from 'vue';
import { PopperPosition, PopperRelative, PopperRelativePosition } from '../props';
import { TriggerElementInfo } from '../use-popper/typing';

interface RenderPopperProps {
  triggerInfo: TriggerElementInfo;
  relative: PopperRelative;
  relativePosition: PopperRelativePosition;
  offsetPosition?: PopperPosition;
  name: string;
  class: string[];
  style: CSSStyleDeclaration;
  visibility: boolean;
  onMouseenter: () => void;
  onMouseleave: () => void;
  onBeforeEnter?: () => void;
  onAfterEnter?: () => void;
  onBeforeLeave?: () => void;
  onAfterLeave?: () => void;
}

function computeBottomPosition(triggerInfo: TriggerElementInfo, isMiddle: boolean) {
  if (isMiddle) {
    return triggerInfo.top + triggerInfo.height / 2;
  }
  return triggerInfo.bottom;
}

function computeRightPosition(triggerInfo: TriggerElementInfo, isMiddle: boolean) {
  if (isMiddle) {
    return triggerInfo.left + triggerInfo.width / 2;
  }
  return triggerInfo.right;
}

function computePosition(triggerInfo: TriggerElementInfo, relativePosition: PopperRelativePosition): PopperPosition {
  const position: PopperPosition = {};
  switch (relativePosition) {
    case PopperRelativePosition.LT:
      position.left = triggerInfo.left;
      position.top = triggerInfo.top;
      break;
    case PopperRelativePosition.LB:
      position.left = triggerInfo.left;
      position.bottom = computeBottomPosition(triggerInfo, false);
      break;
    case PopperRelativePosition.RT:
      position.right = computeRightPosition(triggerInfo, false);
      position.top = triggerInfo.top;
      break;
    case PopperRelativePosition.RB:
      position.right = computeRightPosition(triggerInfo, false);
      position.bottom = computeBottomPosition(triggerInfo, false);
      break;
    case PopperRelativePosition.TM:
      position.left = computeRightPosition(triggerInfo, true);
      position.top = triggerInfo.top;
      break;
    case PopperRelativePosition.RM:
      position.right = computeRightPosition(triggerInfo, false);
      position.top = computeBottomPosition(triggerInfo, true);
      break;
    case PopperRelativePosition.BM:
      position.bottom = computeBottomPosition(triggerInfo, false);
      position.left = computeRightPosition(triggerInfo, true);
      break;
    case PopperRelativePosition.LM:
      position.left = triggerInfo.left;
      position.top = computeBottomPosition(triggerInfo, true);
      break;
    default:
      position.left = 0;
      position.right = 0;
      break;
  }
  return position;
}

function addPosition(origin: number | undefined, offset: number | undefined) {
  if (isNil(origin)) {
    return undefined;
  }
  if (isNil(offset)) {
    return origin;
  }
  return origin + offset;
}

function computeOffsetPosition(
  triggerPosition: PopperPosition,
  offsetPosition: PopperPosition | undefined
): PopperPosition {
  if (!offsetPosition) {
    return triggerPosition;
  }
  return {
    top: addPosition(triggerPosition.top, offsetPosition.top),
    right: addPosition(triggerPosition.right, offsetPosition.right),
    bottom: addPosition(triggerPosition.bottom, offsetPosition.bottom),
    left: addPosition(triggerPosition.left, offsetPosition.left)
  };
}

function positionToStyle(position: PopperPosition): CSSStyleDeclaration {
  const style: CSSStyleDeclaration = {} as CSSStyleDeclaration;
  const { top, right, bottom, left } = position;
  if (!isNil(top)) {
    style.top = `${top}px`;
  }
  if (!isNil(right)) {
    style.right = `${right}px`;
  }
  if (!isNil(bottom)) {
    style.bottom = `${bottom}px`;
  }
  if (!isNil(left)) {
    style.left = `${left}px`;
  }
  return style;
}

export function computeStyle(
  triggerInfo: TriggerElementInfo,
  relative: PopperRelative,
  relativePosition: PopperRelativePosition,
  offsetPosition: PopperPosition | undefined
): CSSStyleDeclaration {
  let position = computePosition(triggerInfo, relativePosition);
  position = computeOffsetPosition(position, offsetPosition);
  return positionToStyle(position);
}

export default function renderPopper(slots: Record<string, Slot>, props: RenderPopperProps): VNode {
  return createVNode(
    Transition,
    {
      name: props.name,
      onBeforeEnter: props.onBeforeEnter,
      onAfterEnter: props.onAfterEnter,
      onBeforeLeave: props.onBeforeLeave,
      onAfterLeave: props.onAfterLeave
    },
    {
      default: () => [
        withDirectives(
          createVNode(
            'div',
            {
              class: props.class,
              style: {
                ...computeStyle(props.triggerInfo, props.relative, props.relativePosition, props.offsetPosition),
                ...props.style
              },
              onMouseenter: props.onMouseenter,
              onMouseleave: props.onMouseleave
            },
            slots.default()
          ),
          [[vShow, props.visibility]]
        )
      ]
    }
  );
}

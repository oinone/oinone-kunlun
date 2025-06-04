import { OioComponentData } from '@oinone/kunlun-vue-ui-common';
import { PropType } from 'vue';
import {
  DraggableAddedEvent,
  DraggableEndEvent,
  DraggableMovedEvent,
  DraggableRemovedEvent,
  DraggableSendEvent,
  DraggableStartEvent
} from './event';

export interface DraggableItemProperties {
  itemKeyProps: string;
  valueProps: string;
  cloneProps: string;
  groupProps: string;
  addedCallbackProps: string;
  movedCallbackProps: string;
  removedCallbackProps: string;
  moveToSelfCallbackProps: string;
  moveToOtherCallbackProps: string;
}

export const defaultDraggableItemProperties: DraggableItemProperties = {
  itemKeyProps: 'id',
  valueProps: 'elements',
  cloneProps: 'clone',
  groupProps: 'group',
  addedCallbackProps: 'addedCallback',
  movedCallbackProps: 'movedCallback',
  removedCallbackProps: 'removedCallback',
  moveToSelfCallbackProps: 'moveToSelfCallback',
  moveToOtherCallbackProps: 'moveToOtherCallback'
};

/**
 * 事件回调属性配置
 */
export const EventCallbackProps = {
  /**
   * 开始拖拽回调（拖起）
   */
  startCallback: {
    type: Function as PropType<(event: DraggableStartEvent) => void>
  },
  /**
   * 结束拖拽回调（放下）
   */
  endCallback: {
    type: Function as PropType<(event: DraggableEndEvent) => void>
  },
  /**
   * 添加元素后回调
   */
  addedCallback: {
    type: Function as PropType<(event: DraggableAddedEvent) => void>
  },
  /**
   * 移动元素后回调
   */
  movedCallback: {
    type: Function as PropType<(event: DraggableMovedEvent) => void>
  },
  /**
   * 移除元素后回调
   */
  removedCallback: {
    type: Function as PropType<(event: DraggableRemovedEvent) => void>
  },
  /**
   * 移动到自身拖拽区的操作回调
   *
   * @return
   * return false; — for cancel
   * return -1; — insert before target
   * return 1; — insert after target
   * return true; — keep default insertion point based on the direction
   * return void; — keep default insertion point based on the direction
   */
  moveToSelfCallback: {
    type: Function as PropType<
      (sendEvent: DraggableSendEvent, originalEvent: DragEvent) => boolean | number | undefined | void
    >
  },
  /**
   * 移动到其他拖拽区的操作回调
   * @return
   * return false; — for cancel
   * return -1; — insert before target
   * return 1; — insert after target
   * return true; — keep default insertion point based on the direction
   * return undefined | void; — keep default insertion point based on the direction
   */
  moveToOtherCallback: {
    type: Function as PropType<
      (sendEvent: DraggableSendEvent, originalEvent: DragEvent) => boolean | number | undefined | void
    >
  }
};

export enum DraggableDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

export interface DraggableGroup {
  name: string;
  pull?: boolean | string | Function;
  put?: boolean | string | Function;
  revertClone?: boolean;
}

/**
 * vuedraggable原生属性
 */
export const VuedraggableProps = {
  list: {
    type: Array,
    required: true
  },
  itemKey: {
    type: [String, Function],
    required: true
  },
  group: {
    type: [String, Object] as PropType<string | DraggableGroup>
  },
  clone: {
    type: Function
  },
  tag: {
    type: String,
    default: 'div'
  },
  sort: {
    type: Boolean,
    default: true
  },
  direction: {
    type: String as PropType<DraggableDirection>
  },
  swapThreshold: {
    type: Number
  },
  invertSwap: {
    type: Boolean,
    default: false
  },
  invertedSwapThreshold: {
    type: Number
  },
  animation: {
    type: Number,
    default: 150
  },
  delay: {
    type: Number
  },
  disabled: {
    type: Boolean,
    default: false
  }
};

export const OioDraggableProps = {
  ...VuedraggableProps,
  ...EventCallbackProps,
  ...OioComponentData,
  disableAdd: {
    type: Boolean,
    default: false
  },
  disableMove: {
    type: Boolean,
    default: false
  },
  filter: {
    type: Function as PropType<<T>(element: T, index: number) => boolean>
  },
  draggableFilter: {
    type: [String, Function]
  },
  mapper: {
    type: Function as PropType<
      <V, T extends { element: V; index: number }>({ element, index }: { element: V; index: number }) => T
    >
  }
};

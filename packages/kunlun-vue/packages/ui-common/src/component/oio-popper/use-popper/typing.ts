export type EmitType = 'update:visible' | 'after-enter' | 'after-leave' | 'before-enter' | 'before-leave';

export interface TriggerElementInfo {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  scrollTop: number;
  scrollLeft: number;
}

export interface PopperState {
  hoverVisible: boolean;
  popperVisible: boolean;
}

export interface PopperEvents {
  onClick?: (e: Event) => void;
  onMouseenter?: (e: Event) => void;
  onMouseleave?: (e: Event) => void;
  onFocus?: (e: Event) => void;
  onBlur?: (e: Event) => void;
}

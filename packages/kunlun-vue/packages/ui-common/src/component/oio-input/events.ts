import { OioEvent } from '../../event';

export interface InputSearchEvent extends OioEvent {
  /**
   * 原生事件
   */
  event: PointerEvent | KeyboardEvent;
  /**
   * 搜索值
   */
  value: string;
}

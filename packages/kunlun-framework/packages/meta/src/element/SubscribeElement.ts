import { IBaseElement } from './IBaseElement';

/**
 * 事件订阅
 */
interface SubscribeElement extends IBaseElement {
  api: string;
  event: string;
}
export { SubscribeElement };

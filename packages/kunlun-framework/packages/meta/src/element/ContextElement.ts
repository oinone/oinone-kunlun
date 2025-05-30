import { IBaseElement } from './IBaseElement';
import { PropElement } from './PropElement';

/**
 * 上下文，提交数据的时候会转换为variables参数放在请求中
 */
interface ContextElement extends IBaseElement {
  props: PropElement[];
}
export { ContextElement };

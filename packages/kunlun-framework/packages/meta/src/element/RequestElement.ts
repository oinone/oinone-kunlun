import { IBaseElement } from './IBaseElement';
import { FieldElement } from './FieldElement';

/**
 * 自定义api的请求
 */
interface RequestElement extends IBaseElement {
  fields: FieldElement[];
}
export { RequestElement };

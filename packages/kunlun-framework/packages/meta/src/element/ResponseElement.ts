import { IBaseElement } from './IBaseElement';
import { FieldElement } from './FieldElement';

/**
 * 自定义api的响应
 */
interface ResponseElement extends IBaseElement {
  fields: FieldElement[];
}
export { ResponseElement };

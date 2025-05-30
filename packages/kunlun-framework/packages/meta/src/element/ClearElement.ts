import { IBaseElement } from './IBaseElement';
import { FieldElement } from './FieldElement';

/**
 * 待响应后清理的字段
 */
interface ClearElement extends IBaseElement {
  fields: FieldElement[];
}
export { ClearElement };

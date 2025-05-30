import { IBaseElement } from './IBaseElement';
import { LoadType } from '../metadata';
import { ContextElement } from './ContextElement';
import { RequestElement } from './RequestElement';
import { ResponseElement } from './ResponseElement';
import { ClearElement } from './ClearElement';
import { ValidationElement } from './ValidationElement';

/**
 * 自定义api
 */
interface ApiElement extends IBaseElement {
  model: string;
  fun: string;
  type: LoadType;
  context: ContextElement;
  request: RequestElement;
  response: ResponseElement;
  clear: ClearElement;
  validation: ValidationElement;
}
export { ApiElement };

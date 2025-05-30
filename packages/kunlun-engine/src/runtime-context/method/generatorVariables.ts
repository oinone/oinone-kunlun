import { QueryVariables } from '../../service/typing';
import { RuntimeContext } from '../runtime-context';

export default function generatorVariables(this: RuntimeContext, variables?: QueryVariables): QueryVariables {
  if (!variables) {
    variables = {};
  }
  if (!this.virtualModels) {
    return variables;
  }
  variables.metadata = this.virtualModels;
  return variables;
}

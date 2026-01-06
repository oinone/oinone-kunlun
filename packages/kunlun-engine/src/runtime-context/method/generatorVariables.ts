import type { QueryVariables } from '../../service/typing';
import type { RuntimeContext } from '../runtime-context';

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

import { ActionDslDefinition } from '@kunlun/dsl';
import { ActionType } from '@kunlun/meta';
import { SPIOperator, SPIOptions } from '@kunlun/spi';
import { RuntimeAction } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export interface ActionConverterOptions extends SPIOptions {
  actionType: ActionType;
}

export type ActionConverterFunction<
  DSL extends ActionDslDefinition = ActionDslDefinition,
  ACTION extends RuntimeAction = RuntimeAction
> = (runtimeContext: RuntimeContext, dsl: DSL, action: ACTION) => void;

const RESOLVE_TEMPLATE_STORAGE_KEY = 'RESOLVE_RUNTIME_ACTION';

SPIOperator.createStorage({
  key: RESOLVE_TEMPLATE_STORAGE_KEY,
  matchKeys: ['actionType']
});

export function registerConverter<
  DSL extends ActionDslDefinition = ActionDslDefinition,
  ACTION extends RuntimeAction = RuntimeAction
>(options: ActionConverterOptions, fn: ActionConverterFunction<DSL, ACTION>) {
  return SPIOperator.register(RESOLVE_TEMPLATE_STORAGE_KEY, options, fn);
}

export function selectorConverters(options: ActionConverterOptions) {
  return SPIOperator.selectors<ActionConverterFunction>(RESOLVE_TEMPLATE_STORAGE_KEY, options).reverse();
}

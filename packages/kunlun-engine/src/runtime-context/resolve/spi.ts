import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { SPIOperator, SPIOptions } from '@oinone/kunlun-spi';
import { RuntimeContext } from '../runtime-context';

export interface ResolveTemplateOptions extends SPIOptions {
  dslNodeType?: string | DslDefinitionType;
}

export type ResolveTemplateFunction<DSL extends DslDefinition = DslDefinition> = (
  runtimeContext: RuntimeContext,
  dsl: DSL
) => void;

const RESOLVE_TEMPLATE_STORAGE_KEY = 'RESOLVE_TEMPLATE';

SPIOperator.createStorage({
  key: RESOLVE_TEMPLATE_STORAGE_KEY,
  matchKeys: ['dslNodeType']
});

export function registerResolve<DSL extends DslDefinition = DslDefinition>(
  options: ResolveTemplateOptions,
  fn: ResolveTemplateFunction<DSL>
) {
  return SPIOperator.register(RESOLVE_TEMPLATE_STORAGE_KEY, options, fn);
}

export function selectorResolves(options: ResolveTemplateOptions) {
  return SPIOperator.selectors<ResolveTemplateFunction>(RESOLVE_TEMPLATE_STORAGE_KEY, options).reverse();
}

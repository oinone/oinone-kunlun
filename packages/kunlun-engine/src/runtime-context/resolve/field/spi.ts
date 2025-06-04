import { FieldDslDefinition } from '@oinone/kunlun-dsl';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPIOperator, SPIOptions } from '@oinone/kunlun-spi';
import { RuntimeModelField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';

export interface FieldConverterOptions extends SPIOptions {
  viewType?: ViewType;
  ttype?: ModelFieldType | ModelFieldType[];
  multi?: boolean;
}

export type FieldConverterFunction<
  DSL extends FieldDslDefinition = FieldDslDefinition,
  Field extends RuntimeModelField = RuntimeModelField
> = (runtimeContext: RuntimeContext, dsl: DSL, field: Field) => void;

const RESOLVE_TEMPLATE_STORAGE_KEY = 'RESOLVE_RUNTIME_FIELD';

SPIOperator.createStorage({
  key: RESOLVE_TEMPLATE_STORAGE_KEY,
  matchKeys: ['viewType', 'ttype', 'multi']
});

export function registerConverter<
  DSL extends FieldDslDefinition = FieldDslDefinition,
  Field extends RuntimeModelField = RuntimeModelField
>(options: FieldConverterOptions, fn: FieldConverterFunction<DSL, Field>) {
  return SPIOperator.register(RESOLVE_TEMPLATE_STORAGE_KEY, options, fn);
}

export function selectorConverters(options: FieldConverterOptions) {
  return SPIOperator.selectors<FieldConverterFunction>(RESOLVE_TEMPLATE_STORAGE_KEY, options).reverse();
}

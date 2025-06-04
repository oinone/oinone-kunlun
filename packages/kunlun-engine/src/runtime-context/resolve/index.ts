import { DslDefinitionType } from '@oinone/kunlun-dsl';
import { resolveAction } from './action';
import { resolveField } from './field';
import { resolveProperties } from './resolve-properties';
import { registerResolve, ResolveTemplateOptions } from './spi';

export * from './default-layout';
export * from './resolve-view';
export * from './util';

registerResolve({}, resolveProperties);
registerResolve({ dslNodeType: DslDefinitionType.FIELD }, resolveField);
registerResolve({ dslNodeType: DslDefinitionType.ACTION }, resolveAction);

export { registerResolve as registerTemplateResolve, ResolveTemplateOptions };

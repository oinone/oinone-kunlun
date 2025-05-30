import { FieldDslDefinition } from '@kunlun/dsl';
import { ModelFieldType } from '@kunlun/meta';
import { RuntimeRelatedField } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { ResolveUtil } from '../util';
import { selectorConverters } from './spi';

export function convertRelatedField(
  runtimeContext: RuntimeContext,
  dsl: FieldDslDefinition,
  field: RuntimeRelatedField
) {
  const relatedTtype = dsl.relatedTtype?.toUpperCase() as ModelFieldType;
  if (!relatedTtype) {
    return;
  }
  field.relatedTtype = relatedTtype;
  field.related = ResolveUtil.toArray(dsl.related) || [];
  if (!field.related.length) {
    console.error('field related is empty.', field);
  }
  selectorConverters({
    viewType: runtimeContext.view.type,
    ttype: relatedTtype,
    multi: field.multi || false
  }).forEach((resolve) => resolve(runtimeContext, dsl, field));
}

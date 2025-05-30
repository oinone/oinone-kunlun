import { Optional } from '@kunlun/shared';
import { inject, named, optional, tagged } from 'inversify';
import { ServiceIdentifier, ServiceNamed } from '../../typing';
import * as METADATA_KEY from '../metadata-keys';

function autowired() {
  return tagged(METADATA_KEY.AUTOWIRED, true);
}

export function Autowired<Interface>(
  token: ServiceIdentifier<Interface>,
  options?: {
    name?: ServiceNamed;
    required?: boolean;
  }
) {
  return <T extends Object>(target: T, propertyKey: ServiceNamed, parameterIndex?: number) => {
    inject(token)(target, propertyKey, parameterIndex);
    autowired()(target, propertyKey, parameterIndex);
    if (
      Optional.ofNullable(options)
        .map((v) => v!.required)
        .orElse(true) === false
    ) {
      optional()(target, propertyKey, parameterIndex);
    }
    const targetName = options?.name;
    if (targetName) {
      named(targetName)(target, propertyKey, parameterIndex);
    }
  };
}

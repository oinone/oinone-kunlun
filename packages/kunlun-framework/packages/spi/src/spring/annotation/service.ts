import { injectable, interfaces } from 'inversify';
import { BindingToSyntax, ServiceIdentifier, ServiceNamed } from '../../typing';
import { autowiredConstraint } from '../constraint-helper';
import { container } from '../container';
import { ServicePriorityManager } from './priority';

export function Service<Interface, Constructor extends new (...args) => Interface>(
  token: ServiceIdentifier<Interface>,
  options?: {
    name?: ServiceNamed;
    priority?: number;
  }
) {
  return (target: Constructor) => {
    injectable()(target);

    const bindingToSyntax = container.bind<Interface>(token) as BindingToSyntax<Interface>;

    const servicePriorities = ServicePriorityManager.push(token, {
      bindingId: bindingToSyntax._binding.id,
      name: options?.name,
      priority: options?.priority
    });

    const bindingWhenSyntax = bindingToSyntax.to(target).inSingletonScope();

    bindingWhenSyntax.when((request: interfaces.Request) => {
      const namedTag = request.target.getNamedTag();
      if (namedTag) {
        const targetName = options?.name;
        if (targetName) {
          return namedTag.value === targetName;
        }
        return false;
      }
      if (autowiredConstraint(true)) {
        const targetBindingId = servicePriorities[servicePriorities.length - 1]?.bindingId;
        if (targetBindingId == null) {
          return false;
        }
        return request.bindings[0].id === targetBindingId;
      }
      return true;
    });
  };
}

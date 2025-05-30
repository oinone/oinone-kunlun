import { interfaces } from 'inversify';

export type ServiceIdentifier<T> = interfaces.ServiceIdentifier<T>;

export function ServiceIdentifier<T>(description?: string | number): ServiceIdentifier<T> {
  return Symbol(description);
}

export type BindingToSyntax<T> = interfaces.BindingToSyntax<T> & {
  _binding: interfaces.Binding<T>;
};

export type ServiceNamed = string | symbol;

import { isNil } from 'lodash-es';
import { ServiceIdentifier, ServiceNamed } from '../../typing';

export interface ServicePriority {
  bindingId: number;
  name?: ServiceNamed;
  priority?: number;
}

function sort(a: ServicePriority, b: ServicePriority): number {
  const ap = a.priority;
  const bp = b.priority;
  const apn = isNil(ap);
  const bpn = isNil(bp);
  if (apn && bpn) {
    return a.bindingId - b.bindingId;
  }
  if (apn) {
    return -1;
  }
  if (bpn) {
    return 1;
  }
  return ap - bp;
}

export class ServicePriorityManager {
  private static readonly store = new Map<ServiceIdentifier<unknown>, ServicePriority[]>();

  private static readonly storeByPriority = new Map<ServiceIdentifier<unknown>, ServicePriority[]>();

  public static push(token: ServiceIdentifier<unknown>, priority: ServicePriority): ServicePriority[] {
    ServicePriorityManager.getServicePriorities(ServicePriorityManager.store, token).push(priority);
    const storeByPriority = ServicePriorityManager.getServicePriorities(ServicePriorityManager.storeByPriority, token);
    storeByPriority.push(priority);
    storeByPriority.sort(sort);
    return storeByPriority;
  }

  public static getOptimalServiceBindingIndex(token: ServiceIdentifier<unknown>, name?: ServiceNamed): number {
    const { store, storeByPriority } = ServicePriorityManager.getStores(token, name);
    if (!store || !store.length || !storeByPriority || !storeByPriority.length) {
      return -1;
    }
    const { bindingId } = storeByPriority[storeByPriority.length - 1];
    return store.findIndex((v) => v.bindingId === bindingId);
  }

  public static getOptimalServiceBindingIndexes(token: ServiceIdentifier<unknown>, name?: ServiceNamed): number[] {
    const { store, storeByPriority } = ServicePriorityManager.getStores(token, name);
    if (!store || !store.length || !storeByPriority || !storeByPriority.length) {
      return [];
    }
    const indexes: number[] = [];
    for (const servicePriority of storeByPriority) {
      const { bindingId } = servicePriority;
      indexes.push(store.findIndex((v) => v.bindingId === bindingId));
    }
    return indexes;
  }

  private static getStores(token: ServiceIdentifier<unknown>, name?: ServiceNamed) {
    let store: ServicePriority[] | undefined;
    let storeByPriority: ServicePriority[] | undefined;
    if (name) {
      store = ServicePriorityManager.store.get(token)?.filter((v) => v.name === name);
      storeByPriority = ServicePriorityManager.storeByPriority.get(token)?.filter((v) => v.name === name);
    } else {
      store = ServicePriorityManager.store.get(token);
      storeByPriority = ServicePriorityManager.storeByPriority.get(token);
    }
    return {
      store,
      storeByPriority
    };
  }

  private static getServicePriorities(
    store: Map<ServiceIdentifier<unknown>, ServicePriority[]>,
    token: ServiceIdentifier<unknown>
  ): ServicePriority[] {
    let serviceConstructors = store.get(token);
    if (!serviceConstructors) {
      serviceConstructors = [];
      store.set(token, serviceConstructors);
    }
    return serviceConstructors;
  }
}

import { ProtoHelper } from '../utils';

export interface PriorityValue {
  order: number;
}

const PRIORITY_KEY = '__priority__';

export const definePriority = <T extends Function>(target: T, priority: PriorityValue) => {
  ProtoHelper.define(target, PRIORITY_KEY, priority);
};

export const getPriority = <T extends Function>(target: T): PriorityValue => {
  return target[PRIORITY_KEY] || ProtoHelper.get(target, PRIORITY_KEY);
};

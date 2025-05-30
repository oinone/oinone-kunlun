import { cloneDeep } from 'lodash-es';
import { RuntimeContext } from '../runtime-context';

export default async function getInitialValue(this: RuntimeContext): Promise<Record<string, unknown>> {
  let initialValue = this.initialValueCache;
  if (!initialValue) {
    initialValue = await getInitialValueInternal.bind(this)();
    this.initialValueCache = initialValue;
  }
  return cloneDeep(initialValue);
}

async function getInitialValueInternal(this: RuntimeContext): Promise<Record<string, unknown>> {
  const defaultValue = await this.getDefaultValue();
  // const computeContext = ComputeContextManager.get(this.handle);
  // if (!computeContext) {
  //   return defaultValue;
  // }
  // computeContext.compute({
  //   activeRecords: [defaultValue],
  //   rootRecord: defaultValue, // fixme @zbh 20230901 此处无法正确获取真正的rootRecord
  //   openerRecord: {},
  //   scene: this.viewAction?.name || '',
  //   activeRecord: defaultValue
  // });
  return defaultValue;
}

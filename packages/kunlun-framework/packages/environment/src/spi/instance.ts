import { SPIOperator } from '@oinone/kunlun-spi';
import { FrameworkInitializeOptions } from '../framework';
import { FrameworkInstanceGetter } from '../instance/typing';

const CURRENT_INSTANCE_GETTER_KEY = Symbol('__current_instance_getter');

SPIOperator.createStorage({
  key: CURRENT_INSTANCE_GETTER_KEY,
  matchKeys: ['framework', 'isMobile']
});

export function registerCurrentInstanceGetter(options: FrameworkInitializeOptions, getter: FrameworkInstanceGetter) {
  return SPIOperator.register(CURRENT_INSTANCE_GETTER_KEY, options, getter);
}

export function selectorCurrentInstanceGetter(
  options: FrameworkInitializeOptions
): FrameworkInstanceGetter | undefined {
  return SPIOperator.selector(CURRENT_INSTANCE_GETTER_KEY, options);
}

import { ViewType } from '@oinone/kunlun-meta';
import { SPIOperator, SPIOptions } from '@oinone/kunlun-spi';
import { Component } from 'vue';

/**
 * 混入组件存储键
 */
const FIELD_MIXIN_COMPONENT_KEY = '__mobile_field_mixin_component';

/**
 * 混入组件可选项
 */
export interface FieldMixinComponentOptions extends SPIOptions {
  /**
   * 当前视图类型
   */
  viewType: ViewType | ViewType[];
}

/**
 * 创建SPI存储空间
 */
SPIOperator.createStorage({
  key: FIELD_MIXIN_COMPONENT_KEY,
  matchKeys: ['viewType']
});

/**
 * 注册字段混入组件
 * @param options 可选项 {@link FieldMixinComponentOptions}
 * @param component Vue组件
 * @return 是否注册成功
 */
export function registerFieldMixinComponent(options: FieldMixinComponentOptions, component: Component) {
  return SPIOperator.register(FIELD_MIXIN_COMPONENT_KEY, options, component);
}

/**
 * 获取字段混入组件
 * @param options 可选项 {@link FieldMixinComponentOptions}
 * @return Vue组件
 */
export function selectorFieldMixinComponent(options: FieldMixinComponentOptions): Component | undefined {
  return SPIOperator.selector(FIELD_MIXIN_COMPONENT_KEY, options);
}

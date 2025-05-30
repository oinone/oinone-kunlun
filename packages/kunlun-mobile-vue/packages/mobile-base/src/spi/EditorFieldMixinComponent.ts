import { ViewType } from '@kunlun/meta';
import { SPIOperator, SPIOptions } from '@kunlun/spi';
import { Component } from 'vue';

/**
 * 混入组件存储键
 */
const EDITOR_FIELD_MIXIN_COMPONENT_KEY = '__mobile_editor_field_mixin_component';

/**
 * 混入组件可选项
 */
export interface EditorFieldMixinComponentOptions extends SPIOptions {
  /**
   * 当前视图类型
   */
  viewType: ViewType | ViewType[];
}

/**
 * 创建SPI存储空间
 */
SPIOperator.createStorage({
  key: EDITOR_FIELD_MIXIN_COMPONENT_KEY,
  matchKeys: ['viewType']
});

/**
 * 注册编辑字段混入组件
 * @param options 可选项 {@link FieldMixinComponentOptions}
 * @param component Vue组件
 * @return 是否注册成功
 */
export function registerEditorFieldMixinComponent(options: EditorFieldMixinComponentOptions, component: Component) {
  return SPIOperator.register(EDITOR_FIELD_MIXIN_COMPONENT_KEY, options, component);
}

/**
 * 获取编辑字段混入组件
 * @param options 可选项 {@link FieldMixinComponentOptions}
 * @return Vue组件
 */
export function selectorEditorFieldMixinComponent(options: EditorFieldMixinComponentOptions): Component | undefined {
  return SPIOperator.selector(EDITOR_FIELD_MIXIN_COMPONENT_KEY, options);
}

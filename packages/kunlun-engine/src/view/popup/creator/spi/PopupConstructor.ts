import { SPIOperator, SPIOptions } from '@kunlun/spi';
import { IPopupWidget } from '../../typing';

/**
 * 弹出层组件构造器
 */
export type PopupConstructor<T extends IPopupWidget = IPopupWidget> = { new (): T } | T;

const POPUP_CONSTRUCTOR_KEY = '__popup_constructor';

export interface PopupConstructorOptions extends SPIOptions {
  type: string;
}

SPIOperator.createStorage({
  key: POPUP_CONSTRUCTOR_KEY,
  matchKeys: ['type']
});

export function registerPopupConstructor(options: PopupConstructorOptions, fn: PopupConstructor) {
  return SPIOperator.register(POPUP_CONSTRUCTOR_KEY, options, fn, false);
}

export function selectorPopupConstructor(options: PopupConstructorOptions): PopupConstructor | undefined {
  return SPIOperator.selector(POPUP_CONSTRUCTOR_KEY, options);
}

import { FlexColMode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { DefaultColWidget } from './DefaultColWidget';

/**
 * 容器外侧使用的Col与其他组件外侧使用的Col在默认模式上有区别
 */
export class DefaultContainerColWidget extends DefaultColWidget {
  @Widget.Reactive()
  protected get mode() {
    return super.mode || FlexColMode.FULL;
  }
}

import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { BaseElementWidget } from '../../../basic';
import DefaultKeyboardShortcut from './DefaultKeyboardShortcut.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'KeyboardShortcut'
  })
)
export class KeyboardShortcutWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultKeyboardShortcut);
    return this;
  }

  @Widget.Reactive()
  public get keyboardShortcutConfig() {
    return [
      { label: translateValueByKey('向左移动单元格'), keyCodes: ['Shift', 'Tab'] },
      { label: translateValueByKey('向右移动单元格'), keyCodes: ['Tab'] },
      {
        label: translateValueByKey('向上移动单元格'),
        keyCodes: ['Ctrl', 'Shift', 'Enter']
      },
      {
        label: translateValueByKey('向下移动单元格'),
        keyCodes: ['Ctrl', 'Enter']
      },

      { label: translateValueByKey('取消编辑'), keyCodes: ['Escape'] },
      {
        label: translateValueByKey('选中选项'),
        keyCodes: ['Enter']
      }
    ];
  }
}

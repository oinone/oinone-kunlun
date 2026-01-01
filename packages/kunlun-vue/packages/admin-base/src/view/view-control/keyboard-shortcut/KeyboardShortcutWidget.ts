import type { KeyboardConfig, TableKeyboardConfig } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
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
  @Widget.Inject('keyboardConfig')
  protected tableKeyboardConfig: TableKeyboardConfig | undefined;

  @Widget.Reactive()
  public get keyboardConfigs() {
    const configs: { label: string; keyCodes: string[] }[] = [];
    const { tableKeyboardConfig } = this;
    if (!tableKeyboardConfig) {
      return configs;
    }
    const { left, right, up, down, enter, cancel } = tableKeyboardConfig;
    const pushConfig = (config: KeyboardConfig) => {
      const keyCodes: string[] = [];
      const { desc, ctrl, shift, alt, key } = config;
      if (ctrl) {
        keyCodes.push('Ctrl');
      }
      if (shift) {
        keyCodes.push('Shift');
      }
      if (alt) {
        keyCodes.push('Alt');
      }
      keyCodes.push(key);
      configs.push({ label: desc || '未命名快捷键', keyCodes });
    };
    if (left) {
      pushConfig(left);
    }
    if (right) {
      pushConfig(right);
    }
    if (up) {
      pushConfig(up);
    }
    if (down) {
      pushConfig(down);
    }
    if (enter) {
      pushConfig(enter);
    }
    if (cancel) {
      pushConfig(cancel);
    }
    return configs;
  }
}

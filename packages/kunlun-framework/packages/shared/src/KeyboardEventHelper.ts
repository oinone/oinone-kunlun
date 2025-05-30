export enum KeyboardModifier {
  Alt = 'Alt',
  AltGraph = 'AltGraph',
  CapsLock = 'CapsLock',
  Control = 'Control',
  Fn = 'Fn',
  FnLock = 'FnLock',
  Hyper = 'Hyper',
  Meta = 'Meta',
  NumLock = 'NumLock',
  OS = 'OS',
  ScrollLock = 'ScrollLock',
  Shift = 'Shift',
  Super = 'Super',
  Symbol = 'Symbol',
  SymbolLock = 'SymbolLock'
}

/**
 * <h>KeyboardEvent帮助类</h>
 * <p>兼容windows/mac键盘事件以及各种浏览器的键盘事件帮助类</p>
 * @see KeyboardEvent
 */
export class KeyboardEventHelper {
  private event: KeyboardEvent;

  private constructor(event: KeyboardEvent) {
    this.event = event;
  }

  public static newInstance(e: KeyboardEvent) {
    return new KeyboardEventHelper(e);
  }

  /**
   * 是否按下ctrl/command键
   */
  public isPressCtrl() {
    return this.event.ctrlKey || this.event.metaKey;
  }

  /**
   * 是否按下alt/option键
   */
  public isPressAlt() {
    return this.event.altKey;
  }

  /**
   * 是否按下shift键
   */
  public isPressShift() {
    return this.event.shiftKey;
  }

  private static readonly STATE_KEYS = ['Ctrl', 'Alt', 'Shift'];

  public isStateKey() {
    return KeyboardEventHelper.STATE_KEYS.includes(this.event.key);
  }

  /**
   * 获取编辑状态
   * @param keyArg 键盘编辑状态参数
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
   */
  public getModifierState(keyArg: KeyboardModifier | keyof typeof KeyboardModifier) {
    return this.event.getModifierState(keyArg);
  }

  /**
   * 获取KeyCode，按下按键的ASCII码
   */
  public getKeyCode() {
    return this.event.keyCode || this.event.which || this.event.charCode;
  }
}

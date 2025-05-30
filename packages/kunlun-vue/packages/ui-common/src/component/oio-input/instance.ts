/**
 * 输入框聚焦可选项
 */
export interface InputFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all';
}

/**
 * 输入框实例
 */
export interface OioInputInstance {
  /**
   * 聚焦
   */
  focus(options?: InputFocusOptions): void;

  /**
   * 失焦
   */
  blur(): void;
}

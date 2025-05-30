export type NamePath = string | NamePath[];

export interface FormRuleObject {
  required?: boolean;
  message?: string;
  trigger?: string | 'change' | 'blur';

  validator?(rule: FormRuleObject, value: unknown): Promise<string | void>;

  [key: string]: unknown;
}

export interface FormValidationRule {
  [key: string]: FormRuleObject[];
}

export type FormValidationRuleObject<T> = {
  [key in keyof T]: FormRuleObject[];
};

export interface OioFormInstance<T = unknown> {
  getOrigin(): T;

  /**
   * 重置字段
   */
  resetFields(names?: NamePath): Promise<void>;

  /**
   * 清除验证状态
   */
  clearValidate(names?: NamePath): Promise<void>;

  /**
   * 指定字段验证
   * @param names
   */
  validate(names?: NamePath): Promise<any>;

  /**
   * 指定字段验证
   * @param names
   * @deprecated 请使用{@link OioFormInstance#validate}
   */
  validateFields(names?: NamePath): Promise<any>;

  /**
   * 滚动到指定字段
   * @param name
   */
  scrollToField(name: NamePath): Promise<void>;
}

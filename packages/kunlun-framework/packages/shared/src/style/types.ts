/**
 * 标准CSSClass类型
 */
export type CSSClass = string | string[];

/**
 * 标准CSSStyle类型
 */
export type CSSStyle = CSSStyleDeclaration & Record<string, string>;

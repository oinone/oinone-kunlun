import { ObjectValue, RequestContext } from '../types';

/**
 * GQL类型
 */
export type GQLType = 'query' | 'mutation';

export const GQLQueryType: GQLType = 'query';

export const GQLMutationType: GQLType = 'mutation';

/**
 * GQL参数类型
 */
export type GQLParameterType = 'string' | 'number' | 'boolean' | 'enumeration' | 'object' | 'array';

/**
 * GQL请求参数
 */
export type GQLRequestParameter = {
  type: GQLParameterType;
  key: string;
  value: unknown;
  serialize?: boolean;
};

export type SimpleGQLResponseParameter = string | [string, string | SimpleGQLResponseParameter[]];

/**
 * GQL响应参数
 */
export type GQLResponseParameter = string | [string, string | string[] | GQLResponseParameterMap];

export const IS_GQL_PARAMETER_MAP_FLAG = '__is_gql_parameter_map';

interface GQLParameterMap {
  __is_gql_parameter_map: boolean;
}

/**
 * GQL请求参数集合
 */
export interface GQLRequestParameterMap {
  [key: string]: GQLRequestParameter | [string, GQLRequestParameterMap | null];
}

/**
 * GQL响应参数集合
 */
export interface GQLResponseParameterMap {
  [key: string]: GQLResponseParameter | GQLResponseParameterMap;
}

export function generatorGQLRequestParameterMap(): GQLRequestParameterMap {
  const newInstance: GQLRequestParameterMap = {};
  const map = newInstance as unknown as GQLParameterMap;
  map.__is_gql_parameter_map = true;
  return newInstance;
}

export function isGQLRequestParameterMap(value: unknown): value is GQLRequestParameterMap {
  return !!(value as GQLParameterMap)?.__is_gql_parameter_map;
}

export function generatorGQLResponseParameterMap(): GQLResponseParameterMap {
  const newInstance: GQLResponseParameterMap = {};
  const map = newInstance as unknown as GQLParameterMap;
  map.__is_gql_parameter_map = true;
  return newInstance;
}

export function isGQLResponseParameterMap(value: unknown): value is GQLResponseParameterMap {
  return !!(value as GQLParameterMap)?.__is_gql_parameter_map;
}

/**
 * GQL片段
 */
export type GQLFragment = string | GQLFragmentDefinition;

/**
 * GQL片段定义
 */
export interface GQLFragmentDefinition {
  name: string;
  definition: string;
  parameters: GQLResponseParameterMap;
}

/**
 * GQL构建器
 */
export interface GQLBuilder {
  buildRequest(fn: (builder: GQLRequestParameterBuilder) => void): this;

  buildResponse(fn: (builder: GQLResponseParameterBuilder) => void): this;

  responseFragmentParameter(name: string, ...otherNames: string[]): this;

  buildFragment(name: string, definition: string, fn: (builder: GQLResponseParameterBuilder) => void): this;

  mountFragment(name: string, fragment: GQLFragment): this;

  request<T>(moduleName: string, variables?: ObjectValue, context?: RequestContext): Promise<T>;

  toString(): Promise<string>;
}

/**
 * GQL请求参数构建器
 */
export interface GQLRequestParameterBuilder extends AbstractGQLRequestParameterBuilder {
  objectParameter(key: string, value?: unknown): this;

  buildObjectParameter(key: string, fn: (builder: GQLRequestParameterBuilder) => void): this;

  buildArrayParameter<T>(
    key: string,
    list: T[] | null | undefined,
    fn: (builder: GQLRequestParameterBuilder, value: T) => void
  ): this;

  nullParameter(key: string): this;

  nullArrayParameter(key: string): this;
}

/**
 * GQL响应参数构建器
 */
export interface GQLResponseParameterBuilder {
  getParameters(): GQLResponseParameterMap;

  parameter(...key: SimpleGQLResponseParameter[]): this;

  buildParameters(key: string, fn: (builder: GQLResponseParameterBuilder) => void): this;

  fragmentParameter(key: string, name: string): this;
}

/**
 * GQL片段构建器
 */
export interface GQLFragmentBuilder extends GQLResponseParameterBuilder {
  toString(): Promise<string>;
}

interface AbstractGQLRequestParameterBuilder {
  stringParameter(key: string, value: unknown, serialize?: boolean): this;

  numberParameter(key: string, value: unknown): this;

  booleanParameter(key: string, value: unknown): this;

  enumerationParameter(key: string, value: unknown): this;
}

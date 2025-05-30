import { ILevel } from '@kunlun/request';
import { OperationTypeNode } from 'graphql';
import { Component } from 'vue';

export interface DebugFetchRequest {
  url: string;
  body: RequestInit;
  level: number;
}

export type RequestResolveResult = Omit<DebugFetchRequest, 'level'>;

export interface DebugErrorPanel {
  key: string;
  title: string;
  message?: string;
  stackInfo?: string;
  component?: Component;
}

export type DebugErrorAnalysisResult = Omit<DebugErrorPanel, 'key'> & Record<string, unknown>;

export interface DebugRequestFunction {
  key: string;
  gqlIndex: number;
  method: OperationTypeNode;
  namespace: string;
  name: string;
  args?: string[];
  responseData?: string;
}

export interface DebugRequestGraphQLInfo {
  /**
   * key
   */
  key: string;

  /**
   * tab title
   */
  title: string;

  /**
   * gql
   */
  gql: string;

  /**
   * variables
   */
  variables?: string;

  /**
   * 已处理异常
   */
  handledExceptions?: DebugErrorPanel[];
}

export interface DebugRequestGQLBody {
  operationName?: string;

  query?: string;

  variables?: Record<string, unknown>;
}

export interface DebugRequestInfo {
  /**
   * 请求URL
   */
  url?: string;

  /**
   * debug请求URL
   */
  debugUrl?: string;

  /**
   * 请求方式
   */
  method?: string;

  /**
   * 请求函数
   */
  functions?: DebugRequestFunction[];

  /**
   * 完整请求时间
   */
  allDuration?: number;

  /**
   * 连接时间
   */
  connectDuration?: number;

  /**
   * 请求时间
   */
  requestDuration?: number;

  /**
   * 响应时间
   */
  responseDuration?: number;

  /**
   * 异常编码
   */
  errorCode?: string;

  /**
   * 异常信息
   */
  errorMessage?: string;

  /**
   * 请求头
   */
  header?: string;

  /**
   * GraphQL信息
   */
  gqlInfos?: DebugRequestGraphQLInfo[];

  /**
   * 已处理异常
   */
  handledExceptions?: DebugErrorPanel[];
}

export interface DebugFetchResponse {
  data?: string | null;
  hint?: string | null;
}

export interface DebugResponseData {
  data: {
    [namespace: string]: {
      [name: string]: unknown;
    };
  };
  errors?: DebugResponseError[];
  extensions?: {
    debug?: DebugResponseError[];
  };
}

export interface DebugResponseError {
  message?: string;
  extensions?: {
    errorCode?: string;
    errorType?: string;
    extra?: string;
    level?: ILevel;
    messages?: {
      level?: ILevel;
      errorType?: string;
      errorCode?: string;
      message?: string;
    }[];
    extend?: string;
    stackTraceKey?: string;
    stackTraceMsg?: string;
    classification?: string;
  };
}

export interface DebugFieldWidgetGroup {
  model: string;
  fields: DebugFieldWidget[];
}

export interface DebugFieldWidget {
  dsl: string;
}

export const DebugInfoProps = {
  title: {
    type: String
  },
  message: {
    type: String
  },
  stackInfo: {
    type: String
  }
};

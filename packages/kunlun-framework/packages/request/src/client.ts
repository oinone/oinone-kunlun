import { encodeBase64, MatrixRouteHelper, ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { BatchHttpLink } from 'apollo-link-batch-http';
import { ErrorResponse } from 'apollo-link-error';
import { HttpLink } from 'apollo-link-http';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { determine } from 'jstz';
import { HttpClientError } from './exception';
import { GQLMutationType, GQLQueryType, GQLType } from './gql/typing';
import { verify } from './license';
import { RequestError } from './license/RequestError';
import { createDefaultMiddleware, createMiddleware } from './middleware/creator';
import { NetworkInterceptorManager } from './middleware/manager';
import { createOwnSignComponent } from './ownSign';
import { getSessionPath } from './session';
import { HttpClientHook, HttpClientHookToken } from './spi';
import { HttpClientHookAfterData, HttpClientHookBeforeData, HttpClientHookOptions } from './spi/typing';
import {
  IErrorMessage,
  InterceptorOptions,
  IResponseErrorResult,
  IResponseExtensions,
  IResponseNetworkError,
  NetworkInterceptor,
  NetworkMiddlewareHandler,
  ObjectValue,
  RawResponse,
  RequestContext
} from './types';

interface BaseBuilderOption {
  // 模块名，uri 定位
  module: string;
  // model.model，长 model 编码
  model: string;
  // 方法名
  method: string;
  // 入参
  param: string;
  // graphql 变量
  variables?: ObjectValue;
  // 返回体结构
  responseBody?: string;
  // 上下文，目前有返回体展开深度控制（common-model）与请求批量控制
  context?: RequestContext;
}

type QueryBuilderOption = BaseBuilderOption;
type MutateBuilderOption = BaseBuilderOption;

const ownSignKey = 'ownSign';
let localOwnSign = localStorage.getItem(ownSignKey);

export function encodeRsqlBase64(value: string) {
  return `base64:${encodeBase64(value)}`;
}

function encodeGqlRsql(query: any) {
  query?.definitions?.forEach((definition) => {
    const { selectionSet, operation } = definition;
    selectionSet?.selections?.forEach((selection) => {
      selection?.selectionSet?.selections?.forEach((subSelection) => {
        if (operation === 'mutation') {
          if (subSelection.name.value === 'createExportTask') {
            subSelection?.arguments?.forEach((param) => {
              if (param.name.value === 'data') {
                param.value?.fields.forEach((field) => {
                  encodeField('conditionWrapper', 'rsql', field);
                });
              }
            });
          }
        } else if (operation === 'query') {
          subSelection?.arguments?.forEach((method) => {
            encodeField('queryWrapper', 'rsql', method);
          });
        }
      });
    });
  });
}

function encodeField(methodName: string, fieldName: string, method: any) {
  if (method.name.value === methodName) {
    const rsqlField = method.value?.fields?.find((field) => field.name.value === fieldName);
    // 搜索条件不变的情况下会使用缓存，但是缓存里的value已经base64处理过了，所以通过缓存发起的请求不需要再次处理base64了
    if (rsqlField && !rsqlField.value.value?.startsWith('base64:')) {
      // console.log('encodeField', rsqlField.value.value, encodeRsqlBase64(rsqlField.value.value));
      rsqlField.value = { ...rsqlField.value, value: encodeRsqlBase64(rsqlField.value.value) };
    }
  }
}

export class HttpClient {
  private clientMap = new Map<string, ApolloClient<unknown>>();

  private baseURL: string | undefined;

  /**
   * 是否编码rsql条件
   * 编码后安全性更高
   * @private
   */
  private encodeRsql: boolean | undefined = false;

  /**
   * 是否翻译响应结果
   * 后端需要翻译的字符串会用 $(xxxxx) 形式返回
   * @private
   */
  private enableTranslate: boolean | undefined = false;

  private defaultMiddleware: ApolloLink | undefined;

  private middleware: ApolloLink[] = [];

  private static instance: HttpClient;

  /**
   * 请求头
   * @private
   */
  private headers: Record<string, string> = {};

  public static getInstance(): HttpClient {
    if (!this.instance) {
      this.instance = new HttpClient();
    }
    return this.instance;
  }

  public getBaseURL(): string {
    return this.baseURL || window.location.origin;
  }

  public setBaseURL(baseURL: string | undefined) {
    this.baseURL = baseURL;
  }

  public setHeaders(headers: Record<string, string>) {
    this.headers = headers;
  }

  public setEncodeRsql(encodeRsql: boolean | undefined) {
    this.encodeRsql = encodeRsql;
  }

  public getEncodeRsql() {
    return this.encodeRsql;
  }

  public setEnableTranslate(enableTranslate: boolean | undefined) {
    this.enableTranslate = enableTranslate;
  }

  public getEnableTranslate() {
    return this.enableTranslate;
  }

  public getHeaders() {
    return this.headers;
  }

  public setDefaultMiddleware(options: Partial<InterceptorOptions>) {
    const defaultInterceptors = NetworkInterceptorManager.getInterceptors();
    const {
      translate: defaultTranslate,
      networkError: defaultNetworkError,
      actionRedirect: defaultActionRedirect,
      requestSuccess: defaultRequestSuccess,
      loginRedirect: defaultLoginRedirect,
      requestError: defaultRequestError,
      messageHub: defaultMessageHub
    } = defaultInterceptors;
    const {
      translate,
      networkError,
      actionRedirect,
      requestSuccess,
      loginRedirect,
      requestError,
      messageHub,
      beforeInterceptors,
      afterInterceptors
    } = options;

    const finalInterceptors: NetworkInterceptor[] = [];
    this.appendInterceptors(finalInterceptors, beforeInterceptors);
    if (this.getEnableTranslate()) {
      this.appendInterceptor(finalInterceptors, defaultTranslate, translate);
    }
    this.appendInterceptor(finalInterceptors, defaultNetworkError, networkError);
    this.appendInterceptor(finalInterceptors, defaultActionRedirect, actionRedirect);
    this.appendInterceptor(finalInterceptors, defaultRequestSuccess, requestSuccess);
    this.appendInterceptor(finalInterceptors, defaultLoginRedirect, loginRedirect);
    this.appendInterceptor(finalInterceptors, defaultRequestError, requestError);
    this.appendInterceptor(finalInterceptors, defaultMessageHub, messageHub);
    this.appendInterceptors(finalInterceptors, afterInterceptors);
    this.defaultMiddleware = createDefaultMiddleware(finalInterceptors);
  }

  protected appendInterceptors(
    interceptors: NetworkInterceptor[],
    target: NetworkInterceptor | NetworkInterceptor[] | undefined
  ) {
    if (target) {
      (Array.isArray(target) ? target : [target]).forEach((v) => {
        if (v) {
          interceptors.push(v);
        }
      });
    }
  }

  protected appendInterceptor(
    interceptors: NetworkInterceptor[],
    defaultInterceptor: NetworkInterceptor | null | undefined,
    interceptor: NetworkInterceptor | null | undefined
  ) {
    if (interceptor === null) {
      return;
    }
    const finalInterceptor = interceptor || defaultInterceptor;
    if (finalInterceptor) {
      interceptors.push(finalInterceptor);
    }
  }

  public setMiddleware(middleware: NetworkMiddlewareHandler[]) {
    this.middleware = middleware.map((m) => createMiddleware(m));
  }

  public async commonQuery<T = Record<string, unknown>>(option: QueryBuilderOption): Promise<T> {
    const { module, model, method, param, variables, responseBody = '{}', context } = option;
    const queryName = `${model}Query`;
    const body = `query {
      ${queryName} {
        ${method}(${param}) ${responseBody}
      }
    }`;
    const result = await this.query(module, body, { ...variables, ...this.variables }, context);
    return result.data[queryName][method] as T;
  }

  public async commonMutate<T = Record<string, unknown>>(option: MutateBuilderOption): Promise<T> {
    const { module, model, method, param, variables, responseBody = '{}', context } = option;
    const mutationName = `${model}Mutation`;
    const body = `mutation {
      ${mutationName} {
        ${method}(${param}) ${responseBody}
      }
    }`;
    const result = await this.mutate(module, body, { ...variables, ...this.variables }, context);
    return result.data[mutationName][method] as T;
  }

  public query<T = Record<string, unknown>>(
    moduleName: string,
    body: string | DocumentNode,
    variables?: ObjectValue,
    context?: RequestContext
  ): Promise<RawResponse<T>> {
    if (!this.prefetchCheck(GQLQueryType, moduleName)) {
      throw new Error(`Query module`);
    }

    return this.request(GQLQueryType, moduleName, body, variables, context, (hookOptions, requestData) =>
      this.$$query(hookOptions, requestData)
    );
  }

  protected async $$query<T = Record<string, unknown>>(
    hookOptions: HttpClientHookOptions,
    requestData: HttpClientHookBeforeData
  ): Promise<HttpClientHookAfterData<T>> {
    const { moduleName } = hookOptions;
    const { gql: body, variables, context } = requestData;
    const { __queryParams, ...requestContext } = context || {};
    try {
      const result = (await this.getClient(`${moduleName}${this.resolvePostfix(context)}`).query<T>({
        query: this.parseGQL(body),
        variables,
        context: requestContext
      })) as unknown as any;

      verify(result);
      createOwnSignComponent();

      const responseData = requestData as unknown as HttpClientHookAfterData<T>;
      responseData.result = result as unknown as RawResponse<T>;

      return responseData;
    } catch (e) {
      this.throwClientError(e, requestData);
    }
  }

  public mutate<T = Record<string, unknown>>(
    moduleName: string,
    body: string | DocumentNode,
    variables?: ObjectValue,
    context?: RequestContext
  ): Promise<RawResponse<T>> {
    if (!this.prefetchCheck(GQLMutationType, moduleName)) {
      throw new Error(`Mutate module`);
    }

    return this.request(GQLMutationType, moduleName, body, variables, context, (hookOptions, requestData) =>
      this.$$mutate(hookOptions, requestData)
    );
  }

  private async $$mutate<T = Record<string, unknown>>(
    hookOptions: HttpClientHookOptions,
    requestData: HttpClientHookBeforeData
  ) {
    const { moduleName } = hookOptions;
    const { gql: body, variables, context } = requestData;
    const { __queryParams, ...requestContext } = context || {};
    try {
      const result = (await this.getClient(`${moduleName}${this.resolvePostfix(context)}`).mutate({
        mutation: this.parseGQL(body),
        variables,
        context: requestContext
      })) as unknown as any;

      verify(result);

      const responseData = requestData as unknown as HttpClientHookAfterData<T>;
      responseData.result = result as unknown as RawResponse<T>;

      return responseData;
    } catch (e) {
      this.throwClientError(e, requestData);
    }
  }

  private async request<T = Record<string, unknown>>(
    operation: GQLType,
    moduleName: string,
    body: string | DocumentNode,
    variables: ObjectValue | undefined,
    context: RequestContext | undefined,
    executor: (
      hookOptions: HttpClientHookOptions,
      requestData: HttpClientHookBeforeData
    ) => Promise<HttpClientHookAfterData<T>>
  ): Promise<RawResponse<T>> {
    const requestParameters = this.prepareRequestParameters(moduleName, variables, context);
    variables = requestParameters.variables;
    context = requestParameters.context;

    const hookOptions: HttpClientHookOptions = {
      operation,
      moduleName
    };

    const requestData: HttpClientHookBeforeData = {
      gql: body,
      variables,
      context
    };

    await HttpClient.executeHookBefore(hookOptions, requestData);

    const responseData = await executor(hookOptions, requestData);

    await HttpClient.executeHookAfter<T>(hookOptions, responseData);

    return responseData.result;
  }

  private prepareRequestParameters(moduleName: string, variables?: ObjectValue, context?: RequestContext) {
    if (this.extendVariables && this.extendVariables instanceof Function) {
      const extVars = this.extendVariables(moduleName, variables);
      variables = { ...variables, ...extVars };
    }
    return {
      variables: { ...(variables || {}), path: variables?.path || getSessionPath() },
      context: context || {}
    };
  }

  private parseGQL(body: string | DocumentNode): DocumentNode {
    let result: DocumentNode;
    if (typeof body === 'string') {
      result = gql`
        ${body}
      `;
    } else {
      result = body;
    }
    return result;
  }

  private throwClientError(e: unknown, httpClientHookBeforeData: HttpClientHookBeforeData): never {
    const error = e as ErrorResponse & Error;
    if (error?.message?.startsWith('Syntax Error')) {
      console.error('Syntax Error, gql body:', httpClientHookBeforeData);
    }
    if (e instanceof RequestError) {
      throw new Error('Invalid request.');
    }

    throw new HttpClientError(error.message, this.convertThrowError(error), error);
  }

  protected convertThrowError(error: ErrorResponse): IResponseErrorResult {
    const { graphQLErrors, networkError, response } = error;
    return {
      errors: graphQLErrors as unknown as IErrorMessage[],
      extensions: response?.extensions as IResponseExtensions,
      networkError: networkError as IResponseNetworkError
    };
  }

  private getClient(moduleName: string) {
    if (this.clientMap.has(moduleName)) {
      return this.clientMap.get(moduleName)!;
    }

    const baseHttpOptions: HttpLink.Options = {
      uri: `${this.getBaseURL()}/pamirs/${moduleName}`,
      credentials: 'include'
    };

    const headersLink = new ApolloLink((operation, forward) => {
      const extensionHeaders = {
        'Accept-Timezone': determine().name() // 时区
      };

      const url = new URL(
        `${window.location.origin}/${MatrixRouteHelper.decrypt(`${window.location.pathname}${window.location.search}`)
          .replace(';', '?')
          .replaceAll(';', '&')}`
      );
      const addHeaderIfExists = (
        headerName: string,
        headerDefaultValue?: string | null,
        putIfAbsent?: (value) => void
      ) => {
        const headerValue = url.searchParams.get(headerName);
        const value = headerValue || headerDefaultValue;
        if (value != null) {
          putIfAbsent?.(value);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        value && (extensionHeaders[headerName] = value);
      };

      /**
       *  模块 请求头
       */
      addHeaderIfExists('module', moduleName);

      /**
       *  多人协同 请求头
       */
      addHeaderIfExists('ownSign', localOwnSign, (v) => {
        localStorage.setItem(ownSignKey, v);
        localOwnSign = v;
      });

      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...this.headers,
          ...extensionHeaders,
          ...headers
        }
      }));

      return forward(operation);
    });

    const commonHttpLink = new HttpLink({ ...baseHttpOptions });
    const batchHttpLink = new BatchHttpLink({
      ...baseHttpOptions,
      batchInterval: 300,
      batchMax: 20,
      batchDebounce: true
    } as any);
    const httpLink = ApolloLink.split((operation) => operation.getContext().batch, batchHttpLink, commonHttpLink);

    const encodeLink = new ApolloLink((operation, forward) => {
      if (this.getEncodeRsql() && operation.query) {
        try {
          encodeGqlRsql(operation.query);
        } catch (e) {
          console.error('encodeGqlRsql', e);
        }
      }
      return forward(operation);
    });

    const link = ApolloLink.from([
      ...this.middleware,
      ...(this.defaultMiddleware ? [this.defaultMiddleware] : []),
      headersLink,
      encodeLink,
      httpLink
    ] as ApolloLink[]);
    const cache = new InMemoryCache({
      addTypename: false
    });

    const client = new ApolloClient<unknown>({
      link,
      cache,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache'
        },
        query: {
          fetchPolicy: 'no-cache'
        },
        mutate: {
          fetchPolicy: 'no-cache'
        }
      }
    });

    this.clientMap.set(moduleName, client);

    return client;
  }

  private prefetchCheck(operation: GQLType, moduleName: string) {
    if (!moduleName) {
      throw new Error(`Module name is undefined when ${operation}`);
    }

    return true;
  }

  private resolvePostfix(context?: RequestContext): string {
    if (!context) {
      return '';
    }

    let pathStr = '';
    let queryStr = '';

    if (context.batch) {
      pathStr = '/batch';
    }

    if (context.__queryParams) {
      const queryParams = Object.entries(context.__queryParams).map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
      );

      if (queryParams.length > 0) {
        queryStr = `?${queryParams.join('&')}`;
      }
    }

    return `${pathStr}${queryStr}`;
  }

  private variables: Record<string, string> = {};

  public setVariable(name: string, value: string) {
    this.variables[name] = value;
  }

  public removeVariable(name: string) {
    delete this.variables[name];
  }

  /**
   * 扩展variables的自定义函数，返回需要添加或者是覆盖的属性
   * @private
   */
  private extendVariables: Function | undefined = undefined;

  public setExtendVariables(func: Function) {
    this.extendVariables = func;
  }

  public removeExtendVariables() {
    this.extendVariables = undefined;
  }

  private static async executeHookBefore(options: HttpClientHookOptions, data: HttpClientHookBeforeData) {
    await HttpClient.executeHook(options, (hook) => hook.before?.(data));
  }

  private static async executeHookAfter<T>(options: HttpClientHookOptions, data: HttpClientHookAfterData<T>) {
    await HttpClient.executeHook(options, (hook) => hook.after?.(data));
  }

  private static async executeHook(
    options: HttpClientHookOptions,
    executor: (hook: HttpClientHook) => ReturnPromise<void>
  ) {
    await Promise.all(
      SPI.RawInstantiates(HttpClientHookToken)
        .filter((hook) => hook.isSupported(options))
        .map((hook) => executor(hook))
    );
  }
}

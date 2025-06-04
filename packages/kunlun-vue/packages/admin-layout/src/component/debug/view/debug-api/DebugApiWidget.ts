import { SPI } from '@oinone/kunlun-spi';
import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import { DefinitionNode, FieldNode, OperationDefinitionNode, SelectionNode } from 'graphql';
import gql from 'graphql-tag';
import { isArray, isPlainObject } from 'lodash-es';
import {
  DebugErrorPanel,
  DebugFetchRequest,
  DebugFetchResponse,
  DebugRequestFunction,
  DebugRequestGQLBody,
  DebugRequestGraphQLInfo,
  DebugRequestInfo,
  DebugResponseData,
  DebugResponseError,
  RequestResolveResult
} from '../../typing';
import { DebugUtils } from '../debug-utils';
import {
  DebugDefaultStackInfoServiceType,
  DebugStackInfoServiceToken,
  DebugUnhandledExceptionMessage,
  DebugUnhandledExceptionTitle
} from '../service';
import { DebugInfoStorage } from '../storage';
import DebugApi from './DebugApi.vue';

const RESOURCE_TIMING_TYPE = 'resource';

const STACK_TRACE_CODE = 'stackTrace';

function isOperationNode(node: DefinitionNode): node is OperationDefinitionNode {
  return node.kind === 'OperationDefinition';
}

function isFieldNode(node: SelectionNode): node is FieldNode {
  return node.kind === 'Field';
}

export class DebugApiWidget extends VueWidget {
  private performanceObserver?: PerformanceObserver;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DebugApi);
    return this;
  }

  @Widget.Inject()
  @Widget.Reactive()
  protected activeDebugTab?: string;

  @Widget.Reactive()
  private requestInfo: DebugRequestInfo | undefined;

  @Widget.Reactive()
  private responseData: string | undefined;

  @Widget.Method()
  public resetInfo() {
    this.requestInfo = undefined;
    this.responseData = undefined;
    DebugUtils.getDebugStorage().requestInfo = undefined;
    DebugUtils.getDebugStorage().responseData = undefined;
  }

  @Widget.Method()
  public resolveRequestData(data: string): RequestResolveResult | undefined {
    data = data.replace(/\r?\n/g, '');
    const match = data.match(/(\w+)\((.*)\);/);
    if (!match) {
      return undefined;
    }
    const methodName = match[1];
    if (methodName !== 'fetch') {
      return undefined;
    }
    const argsString = match[2].trim();
    if (!argsString) {
      return undefined;
    }
    let args: unknown[];
    try {
      args = JSON.parse(`[${argsString}]`);
    } catch (e) {
      console.error('Arguments resolve error.', e);
      return undefined;
    }
    if (args.length !== 2) {
      return undefined;
    }
    const [arg1, arg2] = args;
    if (typeof arg1 === 'string' && isPlainObject(arg2)) {
      return {
        url: arg1,
        body: arg2 as RequestInit
      };
    }
  }

  @Widget.Method()
  public async request(fetchObject: DebugFetchRequest): Promise<DebugFetchResponse | undefined> {
    try {
      const response = await this.requestAnalysis(fetchObject);
      if (!response.ok) {
        return this.requestError('网络请求失败');
      }
      const data = await response.text();
      try {
        const json = JSON.parse(data);
        return this.requestSuccess(await this.responseAnalysis(json));
      } catch (e) {
        const hint = '响应结果解析失败，请查看完整响应结果';
        console.error(hint, e);
        return {
          data,
          hint
        };
      }
    } catch (e) {
      const hint = '接口测试出现错误';
      console.error(hint, e);
      return {
        data: `${e}`,
        hint
      };
    }
  }

  protected async requestAnalysis(fetchObject: DebugFetchRequest): Promise<Response> {
    const { url, body, level } = fetchObject;
    this.performanceObserver?.observe({ entryTypes: [RESOURCE_TIMING_TYPE] });
    const requestBody = JSON.parse(`${body.body}`);
    const resolveUrl = new URL(url);
    resolveUrl.searchParams.set('debug', `${level}`);
    const debugUrl = resolveUrl.toString();
    this.requestInfo = {
      url,
      debugUrl,
      method: requestBody.method,
      header: DebugUtils.toJSONString(body.headers),
      ...this.gqlAnalysis(requestBody)
    };
    DebugUtils.getDebugStorage().requestInfo = this.requestInfo;
    return await fetch(debugUrl, body);
  }

  protected gqlAnalysis(body: DebugRequestGQLBody | DebugRequestGQLBody[]): {
    gqlInfos: DebugRequestGraphQLInfo[];
    functions: DebugRequestFunction[];
  } {
    const gqlInfos: DebugRequestGraphQLInfo[] = [];
    if (!isArray(body)) {
      body = [body];
    }
    const functions: DebugRequestFunction[] = [];
    for (let i = 0; i < body.length; i++) {
      const gqlBody = body[i];
      const gqlQuery = gqlBody.query?.replace(/\\n/g, '\n');
      if (!gqlQuery) {
        console.error('Invalid gql query.');
        continue;
      }
      gqlInfos.push({
        key: `${i + 1}`,
        title: `GQL#${i + 1}`,
        gql: gqlQuery,
        variables: DebugUtils.toJSONString(gqlBody.variables)
      });
      const nodes = gql`
        ${gqlQuery}
      `.definitions;
      for (const node of nodes) {
        if (!isOperationNode(node)) {
          continue;
        }
        const method = node.operation;
        const namespaceSelections = node.selectionSet.selections.filter(isFieldNode);
        if (!namespaceSelections) {
          continue;
        }
        for (const namespaceSelection of namespaceSelections) {
          const namespace = namespaceSelection.name.value;
          const nameSelections = namespaceSelection.selectionSet?.selections.filter(isFieldNode);
          if (!nameSelections) {
            continue;
          }
          for (const nameSelection of nameSelections) {
            const name = nameSelection.name.value;
            functions.push({
              key: `${functions.length + 1}`,
              gqlIndex: i,
              method,
              namespace,
              name
            });
          }
        }
      }
    }
    return {
      gqlInfos,
      functions
    };
  }

  public async responseAnalysis(responseBody: DebugResponseData | DebugResponseData[]): Promise<string> {
    let { requestInfo } = this;
    if (!requestInfo) {
      requestInfo = this.generatorRequestInfoByResponse(responseBody);
      this.requestInfo = requestInfo;
      DebugUtils.getDebugStorage().requestInfo = requestInfo;
    }
    if (requestInfo) {
      if (!isArray(responseBody)) {
        responseBody = [responseBody];
      }
      this.resolveResponseError(requestInfo, responseBody[0]);
      const { functions, gqlInfos } = requestInfo;
      if (!gqlInfos?.length || !responseBody.length || gqlInfos.length !== responseBody.length) {
        console.error('Invalid response body size.', requestInfo, responseBody);
        return DebugUtils.toJSONString(responseBody);
      }
      for (let i = 0; i < gqlInfos.length; i++) {
        this.resolveResponseDebug(gqlInfos[i], responseBody[i]);
      }
      if (functions) {
        for (const fun of functions) {
          const funData = responseBody[fun.gqlIndex]?.data?.[fun.namespace]?.[fun.name];
          if (funData) {
            fun.responseData = DebugUtils.toJSONString(responseBody[fun.gqlIndex]?.data?.[fun.namespace]?.[fun.name]);
          }
        }
      }
    }
    const responseData = DebugUtils.toJSONString(responseBody);
    this.responseData = responseData;
    return responseData;
  }

  protected resolveResponseError(requestInfo: DebugRequestInfo, responseBody: DebugResponseData) {
    const firstError = responseBody?.errors?.[0];
    if (!firstError) {
      return;
    }
    requestInfo.errorCode = firstError.extensions?.errorCode;
    requestInfo.errorMessage = firstError.extensions?.messages?.[0]?.message || firstError.message;
  }

  protected resolveResponseDebug(
    requestInfo: { handledExceptions?: DebugErrorPanel[] },
    responseBody: DebugResponseData
  ) {
    let errors = responseBody.errors;
    if (!errors?.length || errors?.filter((v) => v.extensions?.errorCode === STACK_TRACE_CODE).length === 0) {
      errors = responseBody.extensions?.debug;
    }
    if (!errors?.length) {
      return;
    }
    const defaultStackInfoService = SPI.RawInstantiate(DebugStackInfoServiceToken, {
      name: DebugDefaultStackInfoServiceType
    })!;
    const handledExceptions: DebugErrorPanel[] = [];
    const unhandledExceptions: DebugResponseError[] = [];
    let index = 1;
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error.extensions?.errorCode !== STACK_TRACE_CODE) {
        continue;
      }
      const type = error.extensions?.stackTraceKey;
      if (!type) {
        console.error('Invalid error type.', error);
        unhandledExceptions.push(error);
        continue;
      }
      let stackInfoService = SPI.RawInstantiate(DebugStackInfoServiceToken, { name: type });
      let usingDefaultService = false;
      if (!stackInfoService) {
        stackInfoService = defaultStackInfoService;
        usingDefaultService = true;
      }
      const handledException = stackInfoService.analysis(error, errors) as unknown as DebugErrorPanel;
      if (handledException) {
        handledException.key = `${index++}`;
        handledExceptions.push(handledException);
      } else if (usingDefaultService) {
        console.error('Invalid stack info service.', error);
        unhandledExceptions.push(error);
      }
    }
    if (handledExceptions.length) {
      requestInfo.handledExceptions = handledExceptions;
    }
    if (defaultStackInfoService && unhandledExceptions.length) {
      const unhandledStackInfos: unknown[] = [];
      for (const unhandledException of unhandledExceptions) {
        const unhandledStackInfo = defaultStackInfoService.parseStackInfo(
          unhandledException,
          errors
        ) as DebugErrorPanel;
        if (unhandledStackInfo) {
          unhandledStackInfos.push(unhandledStackInfo);
        }
      }
      if (unhandledStackInfos.length) {
        handledExceptions.push({
          key: `${index++}`,
          title: DebugUnhandledExceptionTitle,
          message: DebugUnhandledExceptionMessage,
          stackInfo: DebugUtils.toJSONString(unhandledStackInfos)
        });
      }
    }
  }

  protected generatorRequestInfoByResponse(
    responseBody: DebugResponseData | DebugResponseData[]
  ): DebugRequestInfo | undefined {
    if (!isArray(responseBody)) {
      responseBody = [responseBody];
    }
    const gqlInfos: DebugRequestGraphQLInfo[] = [];
    const functions: DebugRequestFunction[] = [];
    let i = 0;
    for (const response of responseBody) {
      const responseData = response.data || {};
      for (const namespace of Object.keys(responseData) || []) {
        const responseFunctionData = responseData[namespace] || {};
        if (typeof responseFunctionData === 'object') {
          for (const name of Object.keys(responseFunctionData) || []) {
            gqlInfos.push({
              key: `${i + 1}`,
              title: `GQL#${i + 1}`,
              gql: ''
            });
            functions.push({
              key: `${functions.length + 1}`,
              gqlIndex: i,
              method: 'query',
              namespace,
              name
            });
            i++;
          }
        }
      }
    }
    if (functions.length) {
      return {
        allDuration: -1,
        gqlInfos,
        functions
      };
    }
  }

  protected requestSuccess(data: string) {
    return {
      data,
      hint: null
    };
  }

  protected requestError(message: string): DebugFetchResponse {
    return {
      hint: message
    };
  }

  protected onStorageUpdate = (storage: DebugInfoStorage) => {
    const that = this.getOperator<this>();
    that.requestInfo = storage.requestInfo;
    that.responseData = storage.responseData;
  };

  protected mounted() {
    this.performanceObserver = new PerformanceObserver((list, observer) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === RESOURCE_TIMING_TYPE) {
          const { requestInfo } = this;
          if (requestInfo) {
            const resourceTiming = entry as PerformanceResourceTiming;
            requestInfo.allDuration = resourceTiming.duration;
            requestInfo.connectDuration = resourceTiming.connectEnd - resourceTiming.connectStart;
            requestInfo.requestDuration = resourceTiming.responseStart - resourceTiming.connectEnd;
            requestInfo.responseDuration = resourceTiming.responseEnd - resourceTiming.responseStart;
          }
        }
      }
      observer.disconnect();
    });
    DebugUtils.getDebugStorage().onUpdate(this.onStorageUpdate.bind(this));
  }

  protected unmounted() {
    DebugUtils.getDebugStorage().clearOnUpdate(this.onStorageUpdate);
  }
}

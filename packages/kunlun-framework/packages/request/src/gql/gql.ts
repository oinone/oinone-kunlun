import { ReturnPromise } from '@kunlun/shared';
import { HttpClient } from '../client';
import { ObjectValue, RequestContext } from '../types';
import { GQLFragmentBuilderImpl, GQLRequestParameterBuilderImpl, GQLResponseParameterBuilderImpl } from './builder';
import { fragmentsToString, requestParametersToString, responseParametersToString } from './convert';
import {
  generatorGQLRequestParameterMap,
  generatorGQLResponseParameterMap,
  GQLBuilder,
  GQLFragment,
  GQLRequestParameterBuilder,
  GQLResponseParameterBuilder,
  GQLType
} from './typing';

const http = HttpClient.getInstance();

export class GQL {
  public static query(modelName: string, name: string, fragments?: GQLFragment[]) {
    return new QueryGQL(modelName, name, fragments);
  }

  public static mutation(modelName: string, name: string, fragments?: GQLFragment[]) {
    return new MutationGQL(modelName, name, fragments);
  }

  public static fragment(name: string, definition: string) {
    return new GQLFragmentBuilderImpl({
      name,
      definition,
      parameters: {}
    });
  }
}

abstract class AbstractGQLBuilder implements GQLBuilder {
  protected readonly type: GQLType;

  protected readonly modelName: string;

  protected readonly name: string;

  protected readonly requestParameters = generatorGQLRequestParameterMap();

  protected readonly responseParameters = generatorGQLResponseParameterMap();

  protected readonly responseFragmentParameters: string[] = [];

  protected readonly fragments: ReturnPromise<GQLFragment>[];

  protected constructor(type: GQLType, modelName: string, name: string, fragments?: GQLFragment[]) {
    this.type = type;
    this.modelName = modelName;
    if (!modelName) {
      console.error('modelName is blank', type, name)
    }
    this.name = name;
    this.fragments = fragments || [];
  }

  public buildRequest(fn: (builder: GQLRequestParameterBuilder) => void) {
    fn(new GQLRequestParameterBuilderImpl(this.requestParameters));
    return this;
  }

  public buildResponse(fn: (builder: GQLResponseParameterBuilder) => void) {
    fn(new GQLResponseParameterBuilderImpl(this.responseParameters));
    return this;
  }

  public responseFragmentParameter(name: string, ...otherNames: string[]) {
    [name, ...(otherNames || [])].forEach((v) => this.responseFragmentParameters.push(v));
    return this;
  }

  public mountFragment(name: string, fragment: ReturnPromise<GQLFragment>) {
    this.fragments.push(fragment);
    return this;
  }

  public buildFragment(name: string, definition: string, fn: (builder: GQLResponseParameterBuilder) => void) {
    const parameters = generatorGQLResponseParameterMap();
    this.fragments.push({
      name,
      definition,
      parameters
    });
    fn(new GQLResponseParameterBuilderImpl(parameters));
    return this;
  }

  public abstract request<T>(moduleName: string, variables?: ObjectValue, context?: RequestContext): Promise<T>;

  public async toString(): Promise<string> {
    const [request, response, fragment] = await Promise.all([
      this.buildRequestParameters(),
      this.buildResponseParameters(),
      this.buildFragments()
    ]);
    return `${this.type}{${this.modelName}{${this.name}${!!request ? `(${request})` : ''}${
      !!response ? `{${response}}` : ''
    }}}${fragment}`;
  }

  private buildRequestParameters(): Promise<string> {
    return requestParametersToString(this.requestParameters, true);
  }

  private buildResponseParameters(): Promise<string> {
    return responseParametersToString(this.responseParameters).then((v) =>
      [v, ...this.responseFragmentParameters.map((vv) => `...${vv}`)].join(',')
    );
  }

  private buildFragments(): Promise<string> {
    return fragmentsToString(this.fragments);
  }
}

class QueryGQL extends AbstractGQLBuilder {
  public constructor(modelName: string, name: string, fragments?: GQLFragment[]) {
    super('query', appendType('query', modelName), name, fragments);
  }

  public async request<T>(moduleName: string, variables?: ObjectValue, context?: RequestContext): Promise<T> {
    return http
      .query<T>(moduleName, await this.toString(), variables, context)
      .then((v) => v.data[this.modelName][this.name]);
  }
}

class MutationGQL extends AbstractGQLBuilder {
  public constructor(modelName: string, name: string, fragments?: GQLFragment[]) {
    super('mutation', appendType('mutation', modelName), name, fragments);
  }

  public async request<T>(moduleName: string, variables?: ObjectValue, context?: RequestContext): Promise<T> {
    return http
      .mutate<T>(moduleName, await this.toString(), variables, context)
      .then((v) => v.data[this.modelName][this.name]);
  }
}

function appendType(type: GQLType, modelName: string): string {
  const target = `${type[0].toUpperCase()}${type.slice(1)}`;
  if (modelName.endsWith(target)) {
    return modelName;
  }
  return `${modelName}${target}`;
}

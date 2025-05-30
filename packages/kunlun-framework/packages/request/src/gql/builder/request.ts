import { generatorGQLRequestParameterMap, GQLRequestParameterBuilder, GQLRequestParameterMap } from '../typing';

export class GQLRequestParameterBuilderImpl implements GQLRequestParameterBuilder {
  private readonly parameters: GQLRequestParameterMap;

  public constructor(parameters: GQLRequestParameterMap) {
    this.parameters = parameters;
  }

  public stringParameter(key: string, value: unknown, serialize?: boolean) {
    this.parameters[key] = {
      type: 'string',
      key,
      value,
      serialize
    };
    return this;
  }

  public numberParameter(key: string, value: unknown) {
    this.parameters[key] = {
      type: 'number',
      key,
      value
    };
    return this;
  }

  public enumerationParameter(key: string, value: unknown) {
    this.parameters[key] = {
      type: 'enumeration',
      key,
      value
    };
    return this;
  }

  public booleanParameter(key: string, value: unknown) {
    this.parameters[key] = {
      type: 'boolean',
      key,
      value
    };
    return this;
  }

  public objectParameter(key: string, value?: string) {
    this.parameters[key] = {
      type: 'object',
      key,
      value
    };
    return this;
  }

  public buildObjectParameter(key: string, fn?: (builder: GQLRequestParameterBuilder) => void) {
    const requestParameters = generatorGQLRequestParameterMap();
    this.parameters[key] = {
      type: 'object',
      key,
      value: requestParameters
    };
    fn?.(new GQLRequestParameterBuilderImpl(requestParameters));
    return this;
  }

  public buildArrayParameter<T>(
    key: string,
    list: T[] | null | undefined,
    fn: (builder: GQLRequestParameterBuilder, value: T) => void
  ) {
    if (list === undefined) {
      return this;
    }
    if (list === null) {
      this.nullParameter(key);
      return this;
    }
    const requestParameters: (GQLRequestParameterMap | null)[] = [];
    this.parameters[key] = {
      type: 'array',
      key,
      value: requestParameters
    };
    for (const value of list) {
      if (value === undefined) {
        continue;
      }
      if (value === null) {
        requestParameters.push(null);
      } else {
        const requestParameter = generatorGQLRequestParameterMap();
        fn(new GQLRequestParameterBuilderImpl(requestParameter), value);
        requestParameters.push(requestParameter);
      }
    }
    return this;
  }

  public nullParameter(key: string) {
    this.parameters[key] = {
      type: 'object',
      key,
      value: 'null'
    };
    return this;
  }

  public nullArrayParameter(key: string) {
    this.parameters[key] = {
      type: 'object',
      key,
      value: '[]'
    };
    return this;
  }
}

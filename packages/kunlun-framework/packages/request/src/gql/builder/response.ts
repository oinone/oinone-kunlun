import {
  generatorGQLResponseParameterMap,
  GQLResponseParameterBuilder,
  GQLResponseParameterMap,
  SimpleGQLResponseParameter
} from '../typing';

export class GQLResponseParameterBuilderImpl implements GQLResponseParameterBuilder {
  private readonly parameters: GQLResponseParameterMap;

  public constructor(parameters: GQLResponseParameterMap) {
    this.parameters = parameters;
  }

  public getParameters(): GQLResponseParameterMap {
    return this.parameters;
  }

  public parameter(...key: SimpleGQLResponseParameter[]) {
    key.forEach((v) => {
      this.$parameter(this.parameters, v);
    });
    return this;
  }

  public buildParameters(key: string, fn: (builder) => void) {
    const parameters = generatorGQLResponseParameterMap();
    fn(new GQLResponseParameterBuilderImpl(parameters));
    this.parameters[key] = [key, parameters];
    return this;
  }

  public fragmentParameter(key: string, name: string) {
    this.parameters[key] = [key, name];
    return this;
  }

  private $parameter(parameters: GQLResponseParameterMap, key: SimpleGQLResponseParameter) {
    if (Array.isArray(key)) {
      const [nextKey, value] = key;
      if (Array.isArray(value)) {
        const nextParameters = generatorGQLResponseParameterMap();
        parameters[nextKey] = nextParameters;
        value.forEach((v) => {
          this.$parameter(nextParameters, v);
        });
      } else {
        parameters[nextKey] = [nextKey, value];
      }
    } else {
      parameters[key] = key;
    }
  }
}

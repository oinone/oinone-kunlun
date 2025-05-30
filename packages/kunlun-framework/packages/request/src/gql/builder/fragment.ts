import { fragmentsToString } from '../convert';
import {
  GQLFragmentBuilder,
  GQLFragmentDefinition,
  GQLResponseParameterBuilder,
  GQLResponseParameterMap,
  SimpleGQLResponseParameter
} from '../typing';
import { GQLResponseParameterBuilderImpl } from './response';

export class GQLFragmentBuilderImpl implements GQLFragmentBuilder {
  private readonly fragment: GQLFragmentDefinition;

  private readonly builder: GQLResponseParameterBuilder;

  public constructor(fragment: GQLFragmentDefinition) {
    this.fragment = fragment;
    this.builder = new GQLResponseParameterBuilderImpl(fragment.parameters);
  }

  public getParameters(): GQLResponseParameterMap {
    return this.builder.getParameters();
  }

  public parameter(...key: SimpleGQLResponseParameter[]) {
    this.builder.parameter(...key);
    return this;
  }

  public buildParameters(key: string, fn: (builder: GQLResponseParameterBuilder) => void) {
    this.builder.buildParameters(key, fn);
    return this;
  }

  public fragmentParameter(key: string, name: string) {
    this.builder.fragmentParameter(key, name);
    return this;
  }

  public toString(): Promise<string> {
    return fragmentsToString([this.fragment]);
  }
}

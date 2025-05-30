import { DocumentNode } from 'graphql';
import { GQLType } from '../gql/typing';
import { ObjectValue, RawResponse, RequestContext } from '../types';

export type HttpClientHookOptions = {
  operation: GQLType;
  moduleName: string;
};

export type HttpClientHookBeforeData = {
  gql: string | DocumentNode;
  variables: ObjectValue;
  context: RequestContext;
};

export type HttpClientHookAfterData<T> = HttpClientHookBeforeData & {
  result: RawResponse<T>;
};

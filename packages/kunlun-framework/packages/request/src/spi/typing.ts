import { DocumentNode } from 'graphql';
import type { GQLType } from '../gql/typing';
import type { ObjectValue, RawResponse, RequestContext } from '../types';

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

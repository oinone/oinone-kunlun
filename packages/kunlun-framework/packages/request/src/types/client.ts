export type ObjectValue = {
  [key: string]: unknown;
};

export type RequestContext = {
  maxDepth?: number;
  batch?: boolean;
  __queryParams?: { [key: string]: unknown };
} & ObjectValue;

export interface RawResponse<T> {
  data: {
    [modelName: string]: {
      [method: string]: T;
    };
  };
}

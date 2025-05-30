import { GraphqlHelper } from '@kunlun/shared';
import { GQLRequestParameterMap, IS_GQL_PARAMETER_MAP_FLAG, isGQLRequestParameterMap } from '../typing';

export default function requestParametersToString(
  requestParameters: GQLRequestParameterMap,
  keepParameter: boolean
): Promise<string> {
  return Promise.all(
    Object.entries(requestParameters).map(async ([k, v]): Promise<string | undefined> => {
      if (k === IS_GQL_PARAMETER_MAP_FLAG) {
        return undefined;
      }
      if (Array.isArray(v)) {
        throw new Error('Invalid parameter define.');
      }
      const { type, key, value, serialize } = v;
      switch (type) {
        case 'string':
          return buildStringRequestParameters(key, value, serialize, keepParameter);
        case 'number':
          return buildNumberRequestParameters(key, value, keepParameter);
        case 'boolean':
          return buildBooleanRequestParameters(key, value, keepParameter);
        case 'enumeration':
          return buildEnumerationRequestParameters(key, value, keepParameter);
        case 'object':
          return buildObjectRequestParameters(key, value, keepParameter);
        case 'array':
          return buildArrayRequestParameters(key, value as GQLRequestParameterMap[], keepParameter);
      }
      return buildNotStringRequestParameters(key, value, keepParameter);
    })
  ).then((values) => values.filter((v) => v != null).join(','));
}

function buildStringRequestParameters(
  key: string,
  value: unknown,
  serialize: boolean | undefined,
  keepParameter: boolean
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    if (keepParameter) {
      return `${key}: null`;
    }
    return undefined;
  }
  let result: string;
  if (Array.isArray(value)) {
    if (serialize) {
      result = GraphqlHelper.serializableStringArray(
        value.filter((v) => !!v).map((v) => GraphqlHelper.serializableSimpleString(`${v}`))
      );
    } else {
      result = GraphqlHelper.serializableStringArray(value.filter((v) => v != null).map((v) => `${v}`));
    }
    return `${key}:${result}`;
  }
  result = `${value}`;
  if (serialize) {
    result = GraphqlHelper.serializableSimpleString(result);
  }
  return `${key}:"${result}"`;
}

function buildNotStringRequestParameters(key: string, value: unknown, keepParameter: boolean) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    if (keepParameter) {
      return `${key}: null`;
    }
    return undefined;
  }
  let result: string;
  if (Array.isArray(value)) {
    result = `[${value
      .filter((v) => v != null)
      .map((v) => `${v}`)
      .join(',')}]`;
  } else {
    result = `${value}`;
  }
  return `${key}:${result}`;
}

function buildNumberRequestParameters(key: string, value: unknown, keepParameter: boolean): string | undefined {
  return buildNotStringRequestParameters(key, value, keepParameter);
}

function buildBooleanRequestParameters(key: string, value: unknown, keepParameter: boolean): string | undefined {
  return buildNotStringRequestParameters(key, value, keepParameter);
}

function buildEnumerationRequestParameters(key: string, value: unknown, keepParameter: boolean): string | undefined {
  return buildNotStringRequestParameters(key, value, keepParameter);
}

async function buildObjectRequestParameters(
  key: string,
  value: unknown,
  keepParameter: boolean
): Promise<string | undefined> {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    if (keepParameter) {
      return `${key}: null`;
    }
    return undefined;
  }
  if (isGQLRequestParameterMap(value)) {
    const val = await requestParametersToString(value, keepParameter);
    if (!val && !keepParameter) {
      return undefined;
    }
    return `${key}:{${val}}`;
  }
  return `${key}:${value}`;
}

async function buildArrayRequestParameters(
  key: string,
  values: (GQLRequestParameterMap | null)[],
  keepParameter: boolean
): Promise<string | undefined> {
  if (values === undefined) {
    return undefined;
  }
  if (values === null) {
    if (keepParameter) {
      return `${key}: null`;
    }
    return undefined;
  }
  const result = await Promise.all(
    values.map(async (value) => {
      if (value === null) {
        if (keepParameter) {
          return 'null';
        }
        return undefined;
      }
      const val = await requestParametersToString(value, keepParameter);
      if (!val && !keepParameter) {
        return undefined;
      }
      return `{${val}}`;
    })
  );
  if (!result.length && !keepParameter) {
    return undefined;
  }
  return `${key}:[${result.filter((v) => v != null).join(',')}]`;
}

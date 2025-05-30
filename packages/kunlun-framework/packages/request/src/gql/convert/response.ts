import { GQLResponseParameterMap, IS_GQL_PARAMETER_MAP_FLAG, isGQLResponseParameterMap } from '../typing';

export default function responseParametersToString(responseParameters: GQLResponseParameterMap): Promise<string> {
  return Promise.all(
    Object.entries(responseParameters).map(async ([k, v]) => {
      if (k === IS_GQL_PARAMETER_MAP_FLAG) {
        return undefined;
      }
      if (Array.isArray(v)) {
        const [key, vv] = v;
        const value = await responseParameterConvert(vv);
        if (value) {
          return `${key}{${value}}`;
        }
        return undefined;
      }
      if (isGQLResponseParameterMap(v)) {
        const value = await responseParameterConvert(v);
        if (value) {
          return `${k}{${value}}`;
        }
        return undefined;
      }
      return v;
    })
  ).then((values) => values.filter((v) => v != null).join(','));
}

type SimpleGQLResponseParameters = (string | [string, SimpleGQLResponseParameters])[];

async function responseParameterConvert(
  value: string | SimpleGQLResponseParameters | GQLResponseParameterMap
): Promise<string | undefined> {
  if (typeof value === 'string') {
    return `...${value}`;
  }
  if (Array.isArray(value)) {
    if (!value.length) {
      return undefined;
    }
    return Promise.all(
      value.map(async (v) => {
        if (Array.isArray(v)) {
          const [key, vv] = v;
          return `${key}{${await responseParameterConvert(vv)}`;
        }
        return v;
      })
    ).then((v) => v.filter((vv) => vv != null).join(','));
  }
  return responseParametersToString(value);
}

import { BooleanHelper, StringHelper } from '@oinone/kunlun-shared';

export interface PropConfigDefinition {
  key: string;
  prefix: string;
}

export function parseConfigs(
  props: Record<string, unknown>,
  definitions: PropConfigDefinition | PropConfigDefinition[]
): Record<string, Record<string, unknown>> {
  const configs: Record<string, Record<string, unknown>> = {};
  let finalDefinitions: PropConfigDefinition[];
  if (Array.isArray(definitions)) {
    finalDefinitions = definitions;
  } else {
    finalDefinitions = [definitions];
  }
  finalDefinitions = finalDefinitions.map((definition) => {
    definition.prefix = `${definition.prefix}-`;
    return definition;
  });
  Object.entries(props).forEach(([propKey, propValue]) => {
    if (propValue == null) {
      return;
    }
    for (const definition of finalDefinitions) {
      const { key, prefix } = definition;
      if (propKey.length >= prefix.length + 1 && propKey.startsWith(prefix)) {
        let config = configs[key];
        if (config == null) {
          config = {};
          configs[key] = config;
        }
        if (typeof propValue === 'string') {
          if (BooleanHelper.isStringBoolean(propValue)) {
            propValue = BooleanHelper.toBoolean(propValue);
          }
        }
        config[StringHelper.kebabCaseToCamelCase(propKey.substring(prefix.length))] = propValue;
        return;
      }
    }
  });
  return configs;
}

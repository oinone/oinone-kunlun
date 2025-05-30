import { fragmentsToString, requestParametersToString, responseParametersToString } from '../gql/convert';

describe('GraphQL Convert Functions', () => {
  describe('fragmentsToString', () => {
    test('should handle basic fragment conversion', async () => {
      const fragments = [
        {
          name: 'TestFragment',
          definition: 'TestType',
          parameters: {}
        }
      ];
      const result = await fragmentsToString(fragments);
      expect(result).toBe('fragment TestFragment on TestType {}');
    });

    test('should handle string fragments directly', async () => {
      const testString = 'fragment TestFragment on TestType {field1:"value1"}';
      const fragments = [testString];
      const result = await fragmentsToString(fragments);
      expect(result).toBe(testString);
    });

    test('should handle async fragments', async () => {
      const fragments = [Promise.resolve({ name: 'TestFragment', definition: 'TestType', parameters: {} })];
      const result = await fragmentsToString(fragments);
      expect(result).toBe('fragment TestFragment on TestType {}');
    });
  });

  describe('requestParametersToString', () => {
    test('should handle string parameter', async () => {
      const params = { field1: { type: 'string', key: 'field1', value: 'value1' } };
      const result = await requestParametersToString(params, false);
      expect(result).toBe('field1:"value1"');
    });

    test('should handle number parameter', async () => {
      const params = { field1: { type: 'number', key: 'field1', value: 123 } };
      const result = await requestParametersToString(params, false);
      expect(result).toBe('field1:123');
    });

    test('should handle boolean parameter', async () => {
      const params = { field1: { type: 'boolean', key: 'field1', value: true } };
      const result = await requestParametersToString(params, false);
      expect(result).toBe('field1:true');
    });

    test('should handle enumeration parameter', async () => {
      const params = { field1: { type: 'enumeration', key: 'field1', value: 'ENUM_VALUE' } };
      const result = await requestParametersToString(params, false);
      expect(result).toBe('field1:ENUM_VALUE');
    });

    test('should handle array parameter', async () => {
      const params = { field1: { type: 'array', key: 'field1', value: [{ nestedField: 'nestedValue' }] } };
      const result = await requestParametersToString(params, false);
      expect(result).toBe('field1:[]');
    });

    test('should handle keepParameter option', async () => {
      const params = { field1: { type: 'string', key: 'field1', value: null } };
      const result = await requestParametersToString(params, true);
      expect(result).toBe('field1: null');
    });
  });

  describe('responseParametersToString', () => {
    test('should handle basic field conversion', async () => {
      const params = { field1: 'value1', field2: 'value2' };
      const result = await responseParametersToString(params);
      expect(result).toBe('value1,value2');
    });

    test('should handle nested structures', async () => {
      const params = { field1: ['nestedField', { nestedField: 'nestedValue' }] };
      const result = await responseParametersToString(params);
      expect(result).toBe('nestedField{nestedValue}');
    });

    test('should filter out special flags', async () => {
      const params = { __is_gql_parameter_map: true, field1: 'value1' };
      const result = await responseParametersToString(params);
      expect(result).toBe('value1');
    });

    test('should handle array expansion', async () => {
      const params = { field1: ['value1', 'value2'] };
      const result = await responseParametersToString(params);
      expect(result).toBe('value1{...value2}');
    });
  });
});

import { GQLResponseParameterBuilderImpl } from '../gql/builder/response';
import { GQLRequestParameterBuilderImpl } from '../gql/builder/request';

jest.mock('../gql/typing', () => ({
  ...jest.requireActual('../gql/typing'),
  generatorGQLResponseParameterMap: () => ({}),
  generatorGQLRequestParameterMap: () => ({})
}));

describe('GQLResponseParameterBuilderImpl', () => {
  let builder: GQLResponseParameterBuilderImpl;

  beforeEach(() => {
    builder = new GQLResponseParameterBuilderImpl({});
  });

  describe('parameter', () => {
    test('should handle simple parameters', () => {
      builder.parameter('id', 'name');
      expect(builder.getParameters()).toEqual({
        id: 'id',
        name: 'name'
      });
    });

    test('should handle array parameters with nested structure', () => {
      builder.parameter(
        [
          'filter',
          [
            ['name', 'test'],
            ['age', '18']
          ]
        ],
        ['pagination', ['page', '1']]
      );

      expect(builder.getParameters()).toEqual({
        filter: {
          name: ['name', 'test'],
          age: ['age', '18']
        },
        pagination: {
          '1': '1',
          page: 'page'
        }
      });
    });

    test('should merge multiple parameter calls', () => {
      builder.parameter('id').parameter(['filter', [['name', 'test']]]);

      expect(builder.getParameters()).toEqual({
        id: 'id',
        filter: {
          name: ['name', 'test']
        }
      });
    });
  });

  describe('buildParameters', () => {
    test('should build nested parameters', () => {
      builder.buildParameters('nested', (b) => {
        b.parameter('id').buildParameters('deep', (inner) => {
          inner.parameter('createdAt');
        });
      });

      expect(builder.getParameters()).toEqual({
        nested: [
          'nested',
          {
            id: 'id',
            deep: [
              'deep',
              {
                createdAt: 'createdAt'
              }
            ]
          }
        ]
      });
    });
  });

  describe('fragmentParameter', () => {
    test('should add fragment parameters', () => {
      builder.fragmentParameter('user', 'UserFragment');
      expect(builder.getParameters()).toEqual({
        user: ['user', 'UserFragment']
      });
    });

    test('should combine fragment with normal parameters', () => {
      builder.parameter('id').fragmentParameter('post', 'PostFragment');

      expect(builder.getParameters()).toEqual({
        id: 'id',
        post: ['post', 'PostFragment']
      });
    });
  });
});

describe('GQLRequestParameterBuilderImpl', () => {
  let builder: GQLRequestParameterBuilderImpl;
  let parameters;

  beforeEach(() => {
    parameters = {};
    builder = new GQLRequestParameterBuilderImpl(parameters);
  });

  describe('buildArrayParameter', () => {
    test('should build array with elements', () => {
      const list = [{ id: 1 }, { id: 2 }];

      builder.buildArrayParameter('users', list, (b, item) => {
        b.numberParameter('id', item.id);
      });

      expect(parameters.users).toEqual({
        type: 'array',
        key: 'users',
        value: [{ id: { type: 'number', key: 'id', value: 1 } }, { id: { type: 'number', key: 'id', value: 2 } }]
      });
    });

    test('should handle empty array', () => {
      builder.buildArrayParameter('empty', [], () => {});

      expect(parameters.empty).toEqual({
        type: 'array',
        key: 'empty',
        value: []
      });
    });

    test('should ignore undefined list', () => {
      builder.buildArrayParameter('undefined', undefined, () => {});
      expect(parameters.undefined).toBeUndefined();
    });

    test('should set null when list is null', () => {
      builder.buildArrayParameter('null', null, () => {});

      expect(parameters.null).toEqual({
        type: 'object', // 注意这里根据原始实现使用 object 类型表示 null
        key: 'null',
        value: 'null'
      });
    });

    test('should handle nested parameters', () => {
      const products = [
        { id: 1, specs: { color: 'red' } },
        { id: 2, specs: { color: 'blue' } }
      ];

      builder.buildArrayParameter('products', products, (b, item) => {
        b.numberParameter('id', item.id).buildObjectParameter('specs', (pb) => {
          pb.stringParameter('color', item.specs.color);
        });
      });

      expect(parameters.products.value[0].specs.value.color).toEqual({
        type: 'string',
        key: 'color',
        value: 'red',
        serialize: undefined
      });
    });
  });
});

import { GenericFunctionService } from '../src/service';
import { AuthRoleServiceImpl } from '../src/auth/impl/AuthRoleServiceImpl';
import { AbstractListModelApi, AbstractTreeModelApi } from '../src/service/AbstractModelApi';
import { PamirsCompanyServiceImpl } from '../src/business/impl/PamirsCompanyServiceImpl';

jest.mock('../src/service', () => {
  const original = jest.requireActual('../src/service');
  return {
    ...original,
    GenericFunctionService: {
      INSTANCE: {
        simpleExecuteByFun: jest.fn()
      }
    }
  };
});

describe('AuthRoleServiceImpl', () => {
  it('queryListByFilter delegates to GenericFunctionService with modelModel and filter', async () => {
    const service = new AuthRoleServiceImpl();
    const query = {
      rsql: 'code==ADMIN',
      roleCodes: ['ADMIN'],
      userRole: true
    };
    (GenericFunctionService.INSTANCE.simpleExecuteByFun as jest.Mock).mockResolvedValue([
      { id: '1', code: 'ADMIN', name: 'Admin' }
    ]);
    const result = await service.queryListByFilter(query);
    expect(GenericFunctionService.INSTANCE.simpleExecuteByFun).toHaveBeenCalledWith(
      'auth.AuthRole',
      'queryListByFilter',
      query
    );
    expect(result).toEqual([{ id: '1', code: 'ADMIN', name: 'Admin' }]);
  });

  it('queryListByFilter returns empty array when backend returns undefined', async () => {
    const service = new AuthRoleServiceImpl();
    (GenericFunctionService.INSTANCE.simpleExecuteByFun as jest.Mock).mockResolvedValue(undefined);
    const result = await service.queryListByFilter({});
    expect(result).toEqual([]);
  });
});

describe('AbstractListModelApi', () => {
  class TestListApi extends AbstractListModelApi<any> {
    protected get modelModel() {
      return 'test.Model';
    }
  }

  it('convertListData uses default computeKey and computeLabel', () => {
    const api = new TestListApi();
    const list = [
      { id: '1', code: 'A', name: 'NameA' },
      { id: '2', code: 'B', name: 'NameB' }
    ];
    const options = api.convertListData(list);
    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({
      key: 'A',
      value: 'A',
      label: 'NameA',
      data: list[0]
    });
    expect(options[1]).toMatchObject({
      key: 'B',
      value: 'B',
      label: 'NameB',
      data: list[1]
    });
  });
});

describe('AbstractTreeModelApi', () => {
  interface TestTreeData {
    id: string;
    code: string;
    name: string;
    parentCode?: string;
  }

  class TestTreeApi extends AbstractTreeModelApi<TestTreeData> {
    protected get modelModel() {
      return 'test.TreeModel';
    }
  }

  it('convertTreeData builds tree structure based on parentCode', () => {
    const api = new TestTreeApi();
    const list: TestTreeData[] = [
      { id: '1', code: 'root', name: 'Root' },
      { id: '2', code: 'child', name: 'Child', parentCode: 'root' }
    ];
    const tree = api.convertTreeData(list);
    expect(tree).toHaveLength(1);
    const root = tree[0];
    expect(root.key).toBe('root');
    expect(root.title).toBe('Root');
    expect(root.children).toHaveLength(1);
    const child = root.children?.[0];
    expect(child?.key).toBe('child');
    expect(child?.title).toBe('Child');
  });
});

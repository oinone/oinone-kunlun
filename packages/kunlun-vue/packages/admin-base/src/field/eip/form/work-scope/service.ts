import { http } from '@kunlun/service';

export async function queryWorkScope() {
  const body = `
  {
    eipConnGroupQuery {
      queryListByWrapper(queryWrapper: {}) {
        code
        name
      }
    }
  }
  `;
  const result = await http.mutate('base', body);
  return result.data.eipConnGroupQuery.queryListByWrapper as unknown as any[];
}

export async function queryOpenInterface() {
  const body = `{
    eipOpenInterfaceQuery {
      queryListByWrapper(queryWrapper: {}) {
        interfaceName
        name
        connGroupCode
      }
    }
  }`;
  const result = await http.mutate('base', body);
  return result.data.eipOpenInterfaceQuery.queryListByWrapper as unknown as any[];
}

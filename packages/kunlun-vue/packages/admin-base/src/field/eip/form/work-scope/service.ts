import { http } from '@oinone/kunlun-service';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';

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
  const result = await http.mutate(SYSTEM_MODULE_NAME.EIP, body);
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
  const result = await http.mutate(SYSTEM_MODULE_NAME.EIP, body);
  return result.data.eipOpenInterfaceQuery.queryListByWrapper as unknown as any[];
}


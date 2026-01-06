import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { gql, HttpClient } from '@oinone/kunlun-request';
import { http } from '@oinone/kunlun-service';
import { FunctionCache } from '../src/cache/FunctionCache';

async function loginAsAdmin() {
  const query = gql`
    mutation {
      pamirsUserTransientMutation {
        login(user: { login: "admin", password: "admin" }) {
          broken
          errorMsg
          errorCode
        }
      }
    }
  `;
  const result = await http.mutate(SYSTEM_MODULE_NAME.USER, query);
  const data = (result as any).data.pamirsUserTransientMutation.login;
  if (!data || data.broken) {
    throw new Error(data?.errorMsg || 'login failed');
  }
}

describe('real backend integration', () => {
  it('FunctionCache.get can load base.ViewAction.load from real backend', async () => {
    const client = HttpClient.getInstance();
    client.setBaseURL('http://192.168.1.149:31588');
    await loginAsAdmin();
    const fn = await FunctionCache.get('base.ViewAction', 'load');
    expect(fn).toBeDefined();
    expect(fn!.namespace).toBe('base.ViewAction');
    expect(fn!.fun).toBe('load');
  }, 30000);
});

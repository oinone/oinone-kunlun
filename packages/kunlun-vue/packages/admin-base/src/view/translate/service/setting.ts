import { HttpClient } from '@oinone/kunlun-request';

const http = HttpClient.getInstance();

export const getTranslateSetting = async () => {
  const mutation = `{
      globalAppConfigProxyQuery {
        construct(data: {}) {
          id
          code
          extend
        }
      }
    }`;
  const result = await http.mutate('base', mutation);
  return result.data['globalAppConfigProxyQuery']['construct'];
};

export const setTranslateSetting = async (extend) => {
  const mutation = `mutation {
      globalAppConfigProxyMutation {
        saveTranslationManageSetting(
          data: {
            extend: {
              translationManage: ${extend.translationManage}
              toolboxTranslation: ${extend.toolboxTranslation}
            }
          }
        ) {
          id
          extend
        }
      }
    }`;
  const result = await http.mutate('base', mutation);
  return result.data['globalAppConfigProxyMutation']['saveTranslationManageSetting'];
};

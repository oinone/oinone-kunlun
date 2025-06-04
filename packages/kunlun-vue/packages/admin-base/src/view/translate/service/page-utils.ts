import { HttpClient } from '@oinone/kunlun-request';
import { SearchCommonParams, TranslateManageItem } from '../translate-page-util/typings';

const http = HttpClient.getInstance();

const RESOURCE_TRANSLATION_MODEL = 'resource.ResourceTranslation';

export const queryTranslateBox = async ({
  moduleName,
  langCode,
  model,
  action
}: SearchCommonParams): Promise<TranslateManageItem[]> => {
  const mutation = `query {
    translationItemProxyQuery {
      queryByInsertPage(
        data: {
          moduleName: "${moduleName}"
          langCode: "${langCode}"
          model: "${model}"
          action: "${action}"
        }
      ) {
        id
        module
        moduleDefinition {
          displayName
          module
          id
        }
        origin
        target
        scope
        state
        resLang {
          name
          code
        }
        lang {
          name
          code
        }
      }
    }
  }`;
  const result = await http.mutate('translate', mutation);
  return result.data['translationItemProxyQuery']['queryByInsertPage'] as unknown as TranslateManageItem[];
};

export const queryTranslateBoxUpdate = async ({
  moduleName,
  langCode,
  model,
  action
}: SearchCommonParams): Promise<TranslateManageItem[]> => {
  const mutation = `query {
    translationItemProxyQuery {
      queryByChangePage(
        data: {
          moduleName: "${moduleName}"
          langCode: "${langCode}"
          model: "${model}"
          action: "${action}"
        }
      ) {
        id
        module
        moduleDefinition {
          displayName
          module
          id
        }
        origin
        target
        scope
        state
        resLang {
          name
          code
        }
        lang {
          name
          code
        }
      }
    }
  }`;
  const result = await http.mutate('translate', mutation);
  return result.data['translationItemProxyQuery']['queryByChangePage'] as unknown as TranslateManageItem[];
};

export const saveForBoxWithUpdate = async (gql: string): Promise<TranslateManageItem> => {
  const mutation = `mutation {
    resourceTranslationMutation {
      create(
        data: ${gql}
      ) {
        id
      }
    }
  }
  `;
  const result = await http.mutate('translate', mutation, {
    path: `/${RESOURCE_TRANSLATION_MODEL}/create`
  });
  return result.data['resourceTranslationMutation']['create'] as unknown as TranslateManageItem;
};

export const saveAndRefreshForBox = async (gql: string): Promise<TranslateManageItem> => {
  const mutation = `mutation {
    resourceTranslationMutation {
      createOrUpdateAndRefreshBatch(
        data: ${gql}
      ) {
        id
      }
    }
  }
  `;
  const result = await http.mutate('translate', mutation, {
    path: `/${RESOURCE_TRANSLATION_MODEL}/createOrUpdateAndRefreshBatch`
  });
  return result.data['resourceTranslationMutation']['createOrUpdateAndRefreshBatch'] as unknown as TranslateManageItem;
};

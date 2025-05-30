import { HttpClient } from '@kunlun/request';

const http = HttpClient.getInstance();

export const mutateTranslateFile = async (file, workbookId) => {
  const mutation = `mutation {
    translationItemImportMutation {
      importTranslation(
        data: {
          file: { 
            id: "${file.id}", 
            url: "${file.url}", 
            size: ${file.size}, 
            name: "${file.name}" ,
            type: ${file.type}
          }
          workbookId: "${workbookId}"
        }
      ) {
        comments
      }
    }
  }`;
  const result = await http.mutate('translate', mutation);
  return result.data['translationItemImportMutation']['importTranslation'];
};

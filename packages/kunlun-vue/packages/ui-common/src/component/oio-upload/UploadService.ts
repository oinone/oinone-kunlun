import { GenericFunctionService } from '@kunlun/engine';
import { Condition, HttpClient, ObjectValue } from '@kunlun/request';
import { GraphqlHelper, UrlHelper } from '@kunlun/shared';

export interface CdnFileSingleUploadData {
  /**
   * 上传方式 默认: POST
   */
  httpMethod?: string;
  /**
   * 上传URL
   */
  uploadUrl: string;

  /**
   * Headers
   */
  uploadHeaders?: Record<string, string>;

  /**
   * FormData
   */
  uploadFormData?: Record<string, string>;
}

export interface CdnFileCompleteUploadData extends CdnFileSingleUploadData {
  /**
   * 上传完成数据
   */
  uploadData: string;
  /**
   * 上传完成分片数据
   */
  uploadPartData: string;
  /**
   * 上传完成分片上下文
   */
  uploadPartContext: Record<string, string>;
}

export interface CdnFileMultipartUploadData {
  /**
   * 分片上传请求数据
   */
  uploadDataList: CdnFileSingleUploadData[];
  /**
   * 上传完成请求数据
   */
  completeUploadData: CdnFileCompleteUploadData;
  /**
   * 支持暂停URL
   */
  pauseUrl?: string;
  /**
   * 支持恢复URL
   */
  resumeUrl?: string;
}

export interface CdnFileUploadData {
  /**
   * 下载URL
   */
  downloadUrl: string;
  /**
   * 文件名
   */
  filename: string;
  /**
   * 单文件上传JSON数据
   */
  singleUploadJson: string;
  /**
   * 单文件上传数据
   */
  singleUploadData: CdnFileSingleUploadData;
  /**
   * 分片上传/断点续传JSON数据
   */
  multipartUploadJson?: string;
  /**
   * 分片上传/断点续传数据
   */
  multipartUploadData?: CdnFileMultipartUploadData;
}

export interface UploadChunkFile {
  partNumber: number;
  fileSize: number;
}

const http = HttpClient.getInstance();

const BASE_MODULE_NAME = 'base';

const FILE_MODULE_NAME = 'file';

const getFileSignature = async (
  filename: string,
  cdnKey?: string,
  fileInfo?: {
    size: number;
    accept?: string;
    type: string;
    chunkFiles: UploadChunkFile[];
  }
): Promise<CdnFileUploadData> => {
  // const chunkFilesCondition =
  //   fileInfo?.chunkFiles
  //     ?.map((chunk) => {
  //       return `{${Object.entries(chunk)
  //         .map(([k, v]) => `${k}: ${v}`)
  //         .join(',')}}`;
  //     })
  //     .join(',') || '';

  // FIXME 升级5.1的时候，删除下面代码-----start-----
  const res = (await GenericFunctionService.INSTANCE.executeByFun(
    'file.ResourceFileForm',
    'uploadFormData',
    {
      deep: 1
    },
    {
      filename,
      fileName: filename,
      fileSize: fileInfo?.size?.toString(),
      accept: fileInfo?.accept,
      contentType: fileInfo?.type,
      cdnKey: cdnKey,
      chunkFiles: fileInfo?.chunkFiles
    }
  )) as any;

  let { formDataJson, uploadUrl, multipartUploadJson, singleUploadJson } = res;

  if (formDataJson) {
    multipartUploadJson = '';
    singleUploadJson = JSON.stringify({
      uploadUrl,
      uploadFormData: JSON.parse(formDataJson)
    });
  }

  // -----end-----

  // const gql = `query {
  //     resourceFileFormQuery {
  //       uploadFormData(resourceFileForm: {
  //         filename: "${filename}"
  //         ${GraphqlHelper.buildStringGQLParameter('fileSize', fileInfo?.size?.toString())}
  //         ${GraphqlHelper.buildStringGQLParameter('accept', fileInfo?.accept)}
  //         ${GraphqlHelper.buildStringGQLParameter('contentType', fileInfo?.type)}
  //         ${GraphqlHelper.buildStringGQLParameter('cdnKey', cdnKey)}
  //         chunkFiles: ${chunkFilesCondition ? `[${chunkFilesCondition}]` : null}
  //       }){
  //         downloadUrl
  //         filename
  //         singleUploadJson
  //         multipartUploadJson
  //       }
  //     }
  //   }`;
  // const result = await http.query<CdnFileUploadData>(FILE_MODULE_NAME, gql);
  // const res = result.data.resourceFileFormQuery.uploadFormData;
  // const { singleUploadJson, multipartUploadJson } = res;

  if (singleUploadJson) {
    res.singleUploadData = JSON.parse(singleUploadJson);
  }
  if (multipartUploadJson) {
    res.multipartUploadData = JSON.parse(multipartUploadJson);
  }
  return res;
};

const downloadFile = async (url: string, cdnKey?: string) => {
  const mutation = `query{resourceFileFormQuery{downloadFormData(resourceFileForm:{downloadUrl: "${url}"${GraphqlHelper.buildStringGQLParameter(
    'cdnKey',
    cdnKey
  )}}){filename}}}`;
  window.open(UrlHelper.appendBasePath(`/pamirs/${FILE_MODULE_NAME}?query=${encodeURIComponent(mutation)}`), '_blank');
};

// 创建ResourceFile
const createResourceFile = async (response: any, url: string, size: number, name: string, type = 'FILE') => {
  const mutation = `mutation {
      pamirsFileMutation {
        create(data: {
          url: "${url}",
          size: ${size},
          name: "${name}",
          type: ${type}
        }) {
          id
          name
          type
          url
        }
      }
    }`;
  const result = await http.mutate(BASE_MODULE_NAME, mutation);
  return result.data.pamirsFileMutation.create;
};

const createEasyImportTask = async (id, file, variables?: ObjectValue) => {
  const mutation = `mutation {
  excelImportTaskMutation {
    createImportTask(data: {workbookDefinition: {id: ${id}}, file: {id: "${file.id}", url: "${file.url}"}}) {
      name
      state
    }
  }
}`;
  const result = await http.mutate(FILE_MODULE_NAME, mutation, variables);
  return result.data.excelImportTaskMutation.createImportTask;
};

const importTaskWithTableField = async ({ id, file, methodName }, variables?: ObjectValue) => {
  const mutation = `mutation {
      excelImportTaskMutation {
        ${methodName}(data: {workbookDefinition: {id: ${id}}, file: {id: "${file.id}", url: "${file.url}"}}) {
          importDataList
        }
      }
    }`;
  const result = await http.mutate(FILE_MODULE_NAME, mutation, variables);
  return result.data.excelImportTaskMutation[methodName];
};

const getExportWorkBook = async (model, isExport) => {
  const scene = isExport ? 'EXPORT' : 'IMPORT';
  const query = `{
    excelWorkbookDefinitionQuery{
      queryPage(page: {size: 20}, queryWrapper: {rsql: "model == '${model}' and dataStatus == 'ENABLED' and type =in= ('IMPORT_EXPORT','${scene}')"}) {
          content {
            id
            name
            displayName
          }
        }
      }
  }`;
  const result = await http.query(FILE_MODULE_NAME, query);
  return result.data.excelWorkbookDefinitionQuery.queryPage.content;
};

const getEasyImportTemplate = async (id) => {
  const body = `{
    excelWorkbookDefinitionQuery {
      fetchImportTemplateUrl(data: {id: ${id}}) {
        redirectUri
      }
    }
  }`;
  const result = await http.mutate(FILE_MODULE_NAME, body);
  return result.data.excelWorkbookDefinitionQuery.fetchImportTemplateUrl;
};

const createEasyExportTask = async (id, condition: string | Condition) => {
  let queryData = '{}';
  let rsql = condition;
  if (condition instanceof Condition) {
    const conditionBodyData = condition.getConditionBodyData();
    if (conditionBodyData && Object.keys(conditionBodyData).length) {
      queryData = GraphqlHelper.serializableObject(conditionBodyData);
    }
    rsql = condition.toString();
  }

  const conditionWrapper = condition
    ? `,conditionWrapper:{
            rsql: "${rsql}",
            queryData: "${queryData}"
          }`
    : '';
  const mutation = `mutation {
    excelExportTaskMutation {
      createExportTask(data: {workbookDefinition: {id: ${id}}${conditionWrapper}}) {
        id
        name
        state
      }
    }
  }`;
  const result = await http.mutate(FILE_MODULE_NAME, mutation);
  return result.data.excelExportTaskMutation.createExportTask;
};

export {
  createResourceFile,
  getFileSignature,
  downloadFile,
  createEasyImportTask,
  getExportWorkBook,
  getEasyImportTemplate,
  createEasyExportTask,
  importTaskWithTableField
};

import { ConfigHelper } from '@oinone/kunlun-engine';
import { RuntimeConfig } from '@oinone/kunlun-meta';
import { uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { get as getValue, set as setValue } from 'lodash-es';
import {
  CdnFileMultipartUploadData,
  CdnFileSingleUploadData,
  createResourceFile,
  getFileSignature,
  UploadChunkFile
} from './UploadService';

interface IUploadedPartHeader {
  partNumber: string;
  headers: Record<string, any>;
}

type Fn = (...arg) => unknown;

export interface MultipartUploadRuntimeConfig {
  partSize?: number;
  parallel?: number;
  chunkUploadThreshold?: number;

  [key: string]: unknown;
}

export enum IUploadMethod {
  Single = 'Single',
  Multipart = 'Multipart'
}

export interface IUploadFileEventParams {
  /**
   * 上传的文件
   */
  file: File;

  /**
   * 接受文件类型
   */
  accept?: string;

  /**
   * cdn key
   */
  cdnKey?: string;

  /**
   * 是否通过PamirsFile管理文件
   */
  managed?: boolean;

  /**
   * 上传方式，阈值：[直传、分片上传]
   */
  uploadMethod?: IUploadMethod;

  /**
   * 分片大小, 单位M
   */
  partSize?: number;

  /**
   * 文件大小 大于 某个值的时候开启分片上传
   */
  chunkUploadThreshold?: number;

  /**
   * 并发数量
   */
  parallel?: number;

  /**
   * 上传成功
   */
  onSuccess?: Fn;

  /**
   * 上传失败
   */
  onError?: Fn;

  /**
   * 上传中
   */
  onProgress?: Fn;
}

// 将响应头字符串转换为对象的辅助函数
function headersToObject(headers) {
  var result = {};
  var headersArray = headers.trim().split(/[\r\n]+/);

  headersArray.forEach(function (line) {
    var parts = line.split(': ');
    var header = parts.shift();
    var value = parts.join(': ');
    result[header] = value;
  });

  return result;
}

/**
 * 使用分块上传技术上传大文件到OSS
 *
 * @param multipartUploadData 包含上传数据列表和完成上传所需的配置的对象。
 * @param file 要上传的文件对象。
 * @param fileChunks
 * @param chunkSize 每个分块的大小。
 * @param managed 上传成功后，自动托管到OSS
 * @param onSuccess 上传成功时的回调函数，接收上传完成的文件对象和原始文件对象作为参数。
 * @param onError 上传失败时的回调函数，接收错误信息和原始文件对象作为参数。
 * @param onProgress 上传过程中的进度回调函数，接收当前上传进度的百分比、文件对象和状态信息作为参数。
 */
const useMultipartUpload = async (params: {
  multipartUploadData: CdnFileMultipartUploadData;
  file: File;
  fileChunks: Blob[];
  chunkSize: number;
  downloadUrl: string;
  parallel: number;
  managed?: boolean;
  onSuccess?: Fn;
  onError?: Fn;
  onProgress?: Fn;
}) => {
  const { multipartUploadData, file, fileChunks, parallel, chunkSize, downloadUrl, onSuccess, onError, onProgress } =
    params;
  const { uploadDataList, completeUploadData } = multipartUploadData;

  let uploadedChunks = 0;
  let index = 0;
  const uploadedPartHeaders: IUploadedPartHeader[] = [];

  /**
   * 上传单个分块到CDN。
   * @param chunk 要上传的分块数据。
   * @param index 分块的索引。
   * @returns 返回一个Promise，成功时解析为true，失败时reject一个错误。
   */
  const uploadChunk = async (chunk, index) => {
    return new Promise((resolve, reject) => {
      const partNumber = `${index + 1}`;

      const uploadData = uploadDataList[index];
      const { httpMethod, uploadUrl, uploadHeaders, uploadFormData } = uploadData;
      let formData: FormData | undefined;
      if (uploadFormData) {
        formData = new FormData();
        Object.entries(uploadFormData).forEach(([key, value]) => {
          formData!.append(key, value);
        });
        formData.append('file', chunk);
      }

      // 创建XMLHttpRequest并配置上传过程的监控
      const xhr = new XMLHttpRequest();
      xhr.open(httpMethod || 'POST', uploadUrl);

      if (uploadHeaders) {
        Object.entries(uploadHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.upload.onprogress = ({ total, loaded }) => {
        onProgress?.({
          percent: Number.parseFloat(Math.round(((uploadedChunks * chunkSize + loaded) / file.size) * 100).toFixed(2)),
          file,
          status: '上传中...'
        });
      };

      // 处理上传响应
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          // 获取所有的响应头
          const allHeaders = xhr.getAllResponseHeaders();
          const headersObject = headersToObject(allHeaders);

          uploadedPartHeaders.push({
            partNumber,
            headers: headersObject
          });
        }
      };

      xhr.onload = (response) => {
        if ([200, 204].includes(xhr.status)) {
          uploadedChunks++;
          resolve(true);
        } else {
          reject(new Error(`Chunk ${index} upload failed`));
        }
      };

      xhr.onerror = (err) => {
        onError?.(err);
        reject(new Error(`Chunk ${index} upload failed`));
      };

      xhr.send(formData || chunk);
    });
  };

  // 上传完成
  const completeMultipartUpload = async () => {
    const partXML: string[] = [];
    const parts: any[] = [];

    const {
      uploadUrl: uploadCompleteUrl,
      uploadHeaders: uploadCompleteHeaders,
      uploadData: uploadCompleteData,
      uploadPartData: uploadCompletePartData,
      uploadPartContext: uploadCompletePartContext
    } = completeUploadData;

    uploadedPartHeaders
      .sort((a, b) => Number(a.partNumber) - Number(b.partNumber))
      .forEach((opt) => {
        const headerMap: Record<string, any> = {};

        Object.entries(uploadCompletePartContext || {}).map(([k, v]) => {
          const value = getValue(opt, v);
          setValue(headerMap, k, value);
        });

        parts.push(headerMap);

        const xmlString = new Function('partNumber', 'response', `return ${uploadCompletePartData}`)(
          opt.partNumber,
          headerMap.response
        );

        partXML.push(xmlString);
      });

    const allXML = new Function('parts', `return ${uploadCompleteData}`)(partXML.join(''));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadCompleteUrl!);

    if (uploadCompleteHeaders) {
      Object.entries(uploadCompleteHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.send(allXML);
  };

  // 开始上传
  const continuedUpload = async () => {
    try {
      while (index < fileChunks.length) {
        const chunks = fileChunks.slice(index, index + parallel);
        await Promise.all(
          chunks.map(async (chunk, i) => {
            await uploadChunk(chunk, index + i);
          })
        );

        index += parallel;
      }

      index = 0;
      // 所有分块上传成功后，通知服务器合并分块
      await completeMultipartUpload();

      let rst;
      if (params.managed) {
        rst = await createResourceFile('', downloadUrl, file.size, file.name);
      } else {
        rst = {
          id: uniqueKeyGenerator(),
          name: file.name,
          size: file.size,
          url: downloadUrl
        };
      }

      onSuccess?.(rst, downloadUrl);
      return;
    } catch (error: any) {
      // 上传失败的时候，允许从失败的地方从新上传
      // const headers = uploadedPartHeaders.sort((a, b) => Number(a.partNumber) - Number(b.partNumber));
      // const [lastHeader] = headers.slice(-1);

      // if (lastHeader && lastHeader.partNumber) {
      //   index = Number(lastHeader.partNumber) - 1;
      // }

      console.error('🚀 ~ multiPartRequest ~ error:', error);
      onError?.({ [file.name]: `上传失败: ${error.message}` }, file);
    }
  };

  continuedUpload();

  return { continuedUpload };
};

const useSingleUpload = async (params: {
  singleUploadData: CdnFileSingleUploadData;
  file: File;
  downloadUrl: string;
  expandData?: Record<string, any>;
  managed?: boolean;
  onSuccess?: Fn;
  onError?: Fn;
  onProgress?: Fn;
}) => {
  const continuedUpload = async () => {
    const { singleUploadData, file, expandData, downloadUrl, onSuccess, onError, onProgress } = params;
    const formData = new FormData();
    const { uploadFormData, uploadHeaders, uploadUrl } = singleUploadData!;

    const data = Object.assign(uploadFormData || {}, expandData || {}, {});

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    if (xhr !== null) {
      xhr.open('POST', uploadUrl);

      if (uploadHeaders) {
        Object.entries(uploadHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.onerror = onError || (() => {});
      xhr.upload.onprogress = ({ total, loaded }) => {
        onProgress?.({
          percent: Number.parseFloat(Math.round((loaded / total) * 100).toFixed(2)),
          file,
          status: '上传中...'
        });
      };
      xhr.onload = async (response) => {
        if ([200, 204].includes(xhr.status)) {
          let rst;
          if (params.managed) {
            rst = await createResourceFile('', downloadUrl, file.size, file.name);
          } else {
            rst = {
              id: uniqueKeyGenerator(),
              name: file.name,
              size: file.size,
              url: downloadUrl
            };
          }

          onSuccess?.(rst, downloadUrl);
          return;
        }

        onError?.({ [file.name]: `上传失败${xhr.responseText}` }, file, xhr);
      };
      xhr.send(formData);
    }
  };

  continuedUpload();

  return { continuedUpload };
};

export const defaultStaticMultiPartConfig = {
  partSize: 5,
  chunkUploadThreshold: 10,
  parallel: 4
};

export const defaultMultiPartConfig = {
  get runtimeConfig(): MultipartUploadRuntimeConfig {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('multipartUpload'));
  },
  get partSize() {
    return this.runtimeConfig.partSize || defaultStaticMultiPartConfig.partSize;
  },
  get chunkUploadThreshold() {
    return this.runtimeConfig.chunkUploadThreshold || defaultStaticMultiPartConfig.chunkUploadThreshold;
  },
  get parallel() {
    return this.runtimeConfig.parallel || defaultStaticMultiPartConfig.parallel;
  }
};

export const useUploadFileEvent = async (params: IUploadFileEventParams) => {
  const {
    file,
    accept,
    cdnKey,
    uploadMethod,
    managed,
    partSize = defaultMultiPartConfig.partSize,
    chunkUploadThreshold = defaultMultiPartConfig.chunkUploadThreshold,
    parallel = defaultMultiPartConfig.parallel,
    onSuccess,
    onError,
    onProgress
  } = params;

  const totalSize = file.size;
  const chunkSize = partSize * 1024 * 1024;
  const chunks = Math.ceil(totalSize / chunkSize);
  const fileChunks: Blob[] = [];
  let chunkFiles: UploadChunkFile[] = [];

  const M = file.size / 1024 / 1024;

  let start = true;

  if (chunkUploadThreshold && chunkUploadThreshold > M) {
    start = false;
  }

  if (start) {
    for (let i = 0; i < chunks; i++) {
      const fileChunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      fileChunks.push(fileChunk);
      chunkFiles.push({
        partNumber: i + 1,
        fileSize: fileChunk.size
      });
    }
  }

  const { singleUploadData, multipartUploadData, downloadUrl } = await getFileSignature(file.name, cdnKey, {
    size: totalSize,
    accept,
    type: file.type,
    chunkFiles
  });

  // 分片上传
  if (uploadMethod === IUploadMethod.Multipart && multipartUploadData && start) {
    const { continuedUpload } = await useMultipartUpload({
      multipartUploadData,
      file,
      fileChunks,
      chunkSize,
      downloadUrl,
      parallel,
      managed,
      onSuccess,
      onError,
      onProgress
    });
    return continuedUpload;
  }
  // 直传
  const { continuedUpload } = await useSingleUpload({
    singleUploadData,
    file,
    downloadUrl,
    managed,
    onSuccess,
    onError,
    onProgress
  });
  return continuedUpload;
};

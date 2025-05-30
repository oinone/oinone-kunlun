import { FileModel } from './typing';

function isAbsoluteURL(url) {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

function generateRandomNumber(length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decodeFileName(name: string, url: string) {
  let fileName = '';

  try {
    fileName = decodeURIComponent(name);
  } catch (error) {
    const [_url] = url.split('?');
    fileName = _url.split('/').pop()!;
  }

  return fileName;
}

function createFileList(list: any[]): FileModel[] {
  const finalList: FileModel[] = [];
  list.forEach((v) => {
    if (!v) {
      return;
    }
    if (typeof v === 'string') {
      const fileName = decodeFileName(FileHelper.fetchFilename(v), v);
      finalList.push({
        id: FileHelper.generateFileId(),
        name: fileName,
        // 兼容vant
        file: { name: fileName },
        url: v,
        uid: `${Date.now()}${Math.random() * 1000}`
      } as any);
    } else if (v.name && v.url) {
      const fileName = decodeFileName(FileHelper.fetchFilename(v.url), v.url);
      finalList.push({
        ...v,
        id: v.id || FileHelper.generateFileId(),
        name: fileName,
        file: { name: fileName }
      } as any);
    }
  });
  return finalList;
}

export class FileHelper {
  public static fetchFilename(s: string): string {
    const realUrl = isAbsoluteURL(s) ? s : `${location.origin}${s}`;

    let fullFilename;
    try {
      fullFilename = new URL(realUrl).pathname.split('/').pop()!;
    } catch (e) {
      console.error(e);
      return '';
    }

    const underscoreLength = (fullFilename.match(/_/g) || []).length;

    // 上传后的文件名 _1716254857262 或者 _1716278755663.png
    if (underscoreLength === 1 && fullFilename.startsWith('_')) {
      return fullFilename;
    }

    const pi = fullFilename.lastIndexOf('.');
    let filename: string;
    if (pi === -1) {
      filename = fullFilename;
    } else {
      filename = fullFilename.substring(0, pi);
    }
    const si = filename.lastIndexOf('_');
    if (si !== -1) {
      if (pi === -1) {
        return `${filename.substring(0, si)}`;
      }
      return `${filename.substring(0, si)}.${fullFilename.substring(pi + 1, fullFilename.length)}`;
    }
    return fullFilename;
  }

  public static normalizeFileList(list: any[]): FileModel[] {
    const finalList: FileModel[] = [];
    list.forEach((v) => {
      if (!v) {
        return;
      }

      if (typeof v === 'string') {
        finalList.push({
          id: this.generateFileId(),
          name: decodeFileName(FileHelper.fetchFilename(v), v),
          url: v,
          uid: `${Date.now()}${Math.random() * 1000}`
        });
      } else if (v.url) {
        finalList.push({
          ...v,
          // antdv@3.2.14版，图片类型的上传，type属性有值都会识别为普通文件，这样就不会出现预览图
          type: null,
          id: v.id || this.generateFileId(),
          name: v.name || decodeFileName(FileHelper.fetchFilename(v.url), v.url)
        });
      }
    });
    return finalList;
  }

  public static generateFileId(randomLength = 4): string {
    const now = new Date();
    const randomNumber = generateRandomNumber(randomLength);
    return `${String(now.getTime())}${randomNumber}`;
  }

  public static buildFileList(val: any[] | any, limit: number): FileModel[] {
    if (!val) {
      return [];
    }
    let list: any[];
    if (Array.isArray(val)) {
      list = val;
    } else if (val && Object.keys(val).length > 0) {
      list = [val];
    } else {
      list = [];
    }
    let fileList = createFileList(list);
    if (limit && limit >= 1) {
      fileList = fileList.slice(-Number(limit));
    }
    return fileList;
  }
}

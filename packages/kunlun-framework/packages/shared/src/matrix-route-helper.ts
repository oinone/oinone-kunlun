/* eslint-disable @typescript-eslint/no-unused-vars */
const pattern = /\/([a-zA-Z]+\/)*[a-zA-Z]+\?/g;

export class MatrixRouteHelper {
  private static needEncryptionMatrixUrl = false;

  private static redirectName = 'redirect_url=';

  /**
   * @param shouldEncrypt 是否对url进行加密
   */
  public static toggleUrlEncryption(shouldEncrypt: boolean | undefined | null = false) {
    this.needEncryptionMatrixUrl = !!shouldEncrypt;
  }

  /**
   * 加密url参数
   * @param urlParams
   * @returns 加密后的url参数
   */
  public static encryption(urlParams: string) {
    return this.needEncryptionMatrixUrl ? `?${btoa(urlParams)}` : urlParams;
  }

  /**
   * 解密url参数
   * @param urlParams url参数
   * @returns 解密后的url
   */
  public static decrypt(urlParams: string) {
    if (!this.needEncryptionMatrixUrl) {
      return urlParams;
    }

    try {
      const [match] = urlParams.match(pattern) || [];
      if (match) {
        const [a, matrixUrl] = urlParams.split(match);

        //  match = "/page?", 需要转成 "/page"
        const route = match.endsWith('?') ? match.slice(0, -1) : match;

        const newUrlParams = `${route}${atob(matrixUrl)}`;

        if (urlParams.includes(this.redirectName)) {
          const [prefix] = urlParams.split(this.redirectName);

          return `${prefix}${this.redirectName}${newUrlParams}`;
        }
        return newUrlParams;
      }

      return urlParams;
    } catch (error) {
      return urlParams;
    }
  }
}

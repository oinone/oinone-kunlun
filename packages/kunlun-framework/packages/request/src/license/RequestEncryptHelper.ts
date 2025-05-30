import CryptoJS from 'crypto-js';

const iv = CryptoJS.enc.Utf8.parse('abcdefghijklmnop');

export class RequestEncryptHelper {
  // 此方法为测试加解密对称方法，请勿删除
  // public static encrypt(key: string, data: string): string {
  //   return CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
  //     iv,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7
  //   }).toString();
  // }

  public static decrypt(key: string, data: string): string {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      iv,
      ciphertext: CryptoJS.enc.Base64.parse(data)
    });
    return CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Utf8.parse(key), {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
  }
}

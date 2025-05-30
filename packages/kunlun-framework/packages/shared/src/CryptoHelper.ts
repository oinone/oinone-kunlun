import CryptoJS from 'crypto-js';

export function encodeBase64(str: string) {
  const trans = CryptoJS.enc.Utf8.parse(str);
  return CryptoJS.enc.Base64.stringify(trans);
}

export function decodeBase64(str: string) {
  const trans = CryptoJS.enc.Base64.parse(str);
  return CryptoJS.enc.Utf8.stringify(trans);
}

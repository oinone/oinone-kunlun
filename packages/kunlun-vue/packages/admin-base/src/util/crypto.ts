import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse('1234567890abcdefghijklmnopqrstuv');
const iv = CryptoJS.enc.Utf8.parse('1234567890aabbcc');

export const encrypt = (content: string): string => {
  if (typeof content === 'string' && content) {
    const encryptedContent = CryptoJS.AES.encrypt(content, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encryptedContent.ciphertext.toString();
  }

  return '';
};

import {
  CHECK_CHINESE,
  CHECK_CODE,
  CHECK_CONTAINS_CHINESE,
  CHECK_EMAIL,
  CHECK_ENG_NUM,
  CHECK_ID_CARD,
  CHECK_INTEGER,
  CHECK_IP,
  CHECK_NUMBER,
  CHECK_PHONE,
  CHECK_PWD,
  CHECK_TWO_DIG,
  CHECK_URL
} from './regexp';

export const MATCH_FUNCTION = {
  MATCHES,
  CHECK_PHONE: checkPhone,
  CHECK_EMAIL: checkEmail,
  CHECK_USER_NAME: checkUsername,
  CHECK_PWD: checkPwd,
  CHECK_INTEGER: checkInteger,
  CHECK_ID_CARD: checkIdCard,
  CHECK_URL: checkUrl,
  CHECK_CHINESE: checkChinese,
  CHECK_NUMBER: checkNumber,
  CHECK_TWO_DIG: checkTwoDig,
  CHECK_IP: checkIP,
  CHECK_CONTAINS_CHINESE: checkContainsChinese,
  CHECK_CODE: checkCode,
  CHECK_ENG_NUM: checkEngNum,
  CHECK_SIZE: checkSize,
  CHECK_MIN_SIZE: checkMinSize,
  CHECK_MAX_SIZE: checkMaxSize,
  CHECK_SIZE_RANGE: checkSizeRange
};

function MATCHES(text: string | undefined, reg: string | undefined): boolean {
  if (reg == null || text == null) {
    return false;
  }
  return new RegExp(reg).test(text);
}

function checkPhone(text: string) {
  return MATCHES(text, CHECK_PHONE);
}

function checkEmail(text: string) {
  return MATCHES(text, CHECK_EMAIL);
}

function checkUsername(text: string) {
  return text != null && text.trim().length >= 1;
}

function checkPwd(text: string) {
  return MATCHES(text, CHECK_PWD);
}

function checkInteger(text: string) {
  return MATCHES(text, CHECK_INTEGER);
}

function checkIdCard(text: string) {
  return MATCHES(text, CHECK_ID_CARD);
}

function checkUrl(text: string) {
  return MATCHES(text, CHECK_URL);
}

function checkChinese(text: string) {
  return MATCHES(text, CHECK_CHINESE);
}

function checkNumber(text: string) {
  return MATCHES(text, CHECK_NUMBER);
}

function checkTwoDig(text: string) {
  return MATCHES(text, CHECK_TWO_DIG);
}

function checkIP(text: string) {
  return MATCHES(text, CHECK_IP);
}

function checkContainsChinese(text: string) {
  return MATCHES(text, CHECK_CONTAINS_CHINESE);
}

function checkCode(text: string) {
  return MATCHES(text, CHECK_CODE);
}

function checkEngNum(text: string) {
  return MATCHES(text, CHECK_ENG_NUM);
}

function checkSize(text: string, size: number) {
  if (size == null) {
    return false;
  }
  return MATCHES(text, `^.{${size}}$`);
}

function checkMinSize(text: string, size: number) {
  if (size == null) {
    return false;
  }
  return MATCHES(text, `^.{${size},}$`);
}

function checkMaxSize(text: string, size: number) {
  if (size == null) {
    return false;
  }
  return MATCHES(text, `^.{0,${size}}$`);
}

function checkSizeRange(text: string, min: number, max: number) {
  if (min == null || max == null) {
    return false;
  }
  return MATCHES(text, `^.{${min},${max}}$`);
}

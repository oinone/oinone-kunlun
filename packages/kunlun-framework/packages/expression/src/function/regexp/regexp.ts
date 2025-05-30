export const CHECK_PHONE = '^(1[3-9])\\d{9}$';

export const CHECK_EMAIL = '^[a-z0-9A-Z]+[-|a-z0-9A-Z._]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$';

export const CHECK_PWD = '^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9~!@&%#_(.)]{8,16}$';

export const CHECK_INTEGER = '^-{0,1}[0-9]\\d*$?';

export const CHECK_ID_CARD = '^\\(d{15}$|(^\\d{18}$)|(^\\d{17}(\\d|X|x))$';

export const CHECK_URL =
  '^(?:(?:https?)://)(?:(?:1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|[1-9])(?:\\.(?:1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)){2}(?:\\.(?:1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*)(?::([1-9]|[1-9]\\d|[1-9]\\d{2}|[1-9]\\d{3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-5]))?(?:/\\S*)?$';
export const CHECK_CHINESE = '^[\\u4e00-\\u9fa5]{1,}$';

export const CHECK_NUMBER = '^[0-9]*$';

export const CHECK_TWO_DIG = '^-{0,1}[0-9]+(\\.[0-9]{2})?$';

export const CHECK_IP = '^((2[0-4]\\d|25[0-5]|[01]?\\d\\d?)\\.){3}(2[0-4]\\d|25[0-5]|[01]?\\d\\d?)$';

export const CHECK_CONTAINS_CHINESE = '^.?[\\u4e00-\\u9fa5]{0,}.?$';

export const CHECK_CODE = '^[a-z0-9A-Z_]*$';

export const CHECK_ENG_NUM = '^[a-z0-9A-Z]*$';

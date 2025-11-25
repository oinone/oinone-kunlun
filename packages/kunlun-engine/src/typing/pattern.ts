export interface FieldPattern {
  pattern: string;
  help: string;
  patternType: string;
  errorMsg: string;
}

export enum FieldStringPatternType {
  NONE = 'NONE',
  WEB_SITE = 'WEB_SITE',
  ID_CARD = 'ID_CARD',
  PHONE = 'PHONE',
  TELEPHONE = 'TELEPHONE',
  POST_CODE = 'POST_CODE',
  EMAIL = 'EMAIL',
  LETTER_NUMBER = 'LETTER_NUMBER',
  LETTER = 'LETTER',
  UPPER_LETTER = 'UPPER_LETTER',
  LOWER_LETTER = 'LOWER_LETTER',
  SIX_LETTER = 'SIX_LETTER',
  NUMBER = 'NUMBER',
  SIX_NUMBER = 'SIX_NUMBER',
  IP_ADDRESS = 'IP_ADDRESS',
  CAR_NUMBER = 'CAR_NUMBER',
  CHINESE_PASSPORT = 'CHINESE_PASSPORT',
  PASSWORD = 'PASSWORD'
}

export const CommonPatternMap = new Map<string, FieldPattern>();

/**
 * 同 UiDesignerInputPatternEnum 枚举
 */
export const CommonPatternList: FieldPattern[] = [
  {
    help: '无',
    errorMsg: '',
    patternType: FieldStringPatternType.NONE,
    pattern: ''
  },
  {
    help: '网址',
    errorMsg: '网址格式有误',
    patternType: FieldStringPatternType.WEB_SITE,
    pattern:
      '^(https?:\\/\\/|ftp:\\/\\/)?((\\d{1,3}\\.){3}\\d{1,3}|([\\da-z-]+(?:\\.[\\da-z-]+)*)\\.([a-z]{2,6}))(:[0-9]{1,5})?(\\/[^\\s]*)?$'
  },
  {
    help: '身份证',
    errorMsg: '身份证号格式有误',
    patternType: FieldStringPatternType.ID_CARD,
    pattern:
      '(^\\d{8}(0\\d|10|11|12)([0-2]\\d|30|31)\\d{3}$)|(^\\d{6}(18|19|20)\\d{2}(0[1-9]|10|11|12)([0-2]\\d|30|31)\\d{3}(\\d|X|x)$)'
  },
  {
    help: '手机号码',
    errorMsg: '手机号码格式有误',
    patternType: FieldStringPatternType.PHONE,
    pattern: '^(1[3-9])\\d{9}$'
  },
  {
    help: '电话号码',
    errorMsg: '电话号码格式有误',
    patternType: FieldStringPatternType.TELEPHONE,
    pattern: '^(\\d{3,4}-)?\\d{7,8}$'
  },
  {
    help: '邮政编码',
    errorMsg: '邮政编码格式有误',
    patternType: FieldStringPatternType.POST_CODE,
    pattern: '^\\d{6}$'
  },
  {
    help: '邮箱',
    errorMsg: '邮箱格式有误',
    patternType: FieldStringPatternType.EMAIL,
    pattern: '^[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)*(\\.[a-zA-Z]{2,})$'
  },
  {
    help: '字母数字',
    errorMsg: '字母数字格式有误',
    patternType: FieldStringPatternType.LETTER_NUMBER,
    pattern: '^[A-Za-z0-9]*$'
  },
  {
    help: '字母',
    errorMsg: '字母格式有误',
    patternType: FieldStringPatternType.LETTER,
    pattern: '^[A-Za-z]*$'
  },
  {
    help: '大写字母',
    errorMsg: '大写字母格式有误',
    patternType: FieldStringPatternType.UPPER_LETTER,
    pattern: '^[A-Z]*$'
  },
  {
    help: '小写字母',
    errorMsg: '小写字母格式有误',
    patternType: FieldStringPatternType.LOWER_LETTER,
    pattern: '^[a-z]*$'
  },
  {
    help: '6个字母',
    errorMsg: '6个字母格式有误',
    patternType: FieldStringPatternType.SIX_LETTER,
    pattern: '^[A-Za-z]{6}$'
  },
  {
    help: '数字',
    errorMsg: '数字格式有误',
    patternType: FieldStringPatternType.NUMBER,
    pattern: '^\\d*$'
  },
  {
    help: '6位数字',
    errorMsg: '6位数字格式有误',
    patternType: FieldStringPatternType.SIX_NUMBER,
    pattern: '^\\d{6}$'
  },
  {
    help: 'IP地址',
    errorMsg: 'IP地址格式有误',
    patternType: FieldStringPatternType.IP_ADDRESS,
    pattern:
      '^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$|^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::)$|^::ffff:(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$'
  },
  {
    help: '车牌号',
    errorMsg: '车牌号格式有误',
    patternType: FieldStringPatternType.CAR_NUMBER,
    pattern:
      '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z](?:[0-9]{5}|[DF][0-9A-HJ-NP-Z]{5}|警[0-9]{4}|Z[港澳][0-9A-HJ-NP-Z]{4}|军[A-HJ-NP-Z][0-9]{5})|WJ[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][0-9A-HJ-NP-Z]{5}|[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-HJ-NP-Z][0-9]{4}[学练警领使挂]$'
  },
  {
    help: '中国护照',
    errorMsg: '中国护照格式有误',
    patternType: FieldStringPatternType.CHINESE_PASSPORT,
    pattern: '^[PEGSCD](?:\\d{8})$'
  },
  {
    help: '密码',
    errorMsg: '密码格式有误',
    patternType: FieldStringPatternType.PASSWORD,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9~!@&%#_(.)]{8,16}$'
  }
];

function registryCommonPattern() {
  CommonPatternList.forEach((_p) => {
    CommonPatternMap.set(_p.patternType, _p);
  });
}

registryCommonPattern();

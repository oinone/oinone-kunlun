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
  PASSWORD = 'PASSWORD',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE'
}

export const CommonPatternMap = new Map<string, FieldPattern>();

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
      '((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[\\-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9\\.\\-]+|(?:www\\.|[\\-;:&=\\+\\$,\\w]+@)[A-Za-z0-9\\.\\-]+)((?:\\/[\\+~%\\/\\.\\w\\-_]*)?\\??(?:[\\-\\+=&;%@\\.\\w_]*)#?(?:[\\.\\!\\/\\\\\\w]*))?)'
  },
  {
    help: '身份证',
    errorMsg: '身份证号格式有误',
    patternType: FieldStringPatternType.ID_CARD,
    pattern:
      '(^\\d{8}(0\\d|10|11|12)([0-2]\\d|30|31)\\d{3}$)|(^\\d{6}(18|19|20)\\d{2}(0[1-9]|10|11|12)([0-2]\\d|30|31)\\d{3}(\\d|X|x)$)'
  },
  {
    help: '密码',
    errorMsg: '密码格式有误',
    patternType: FieldStringPatternType.PASSWORD,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9~!@&%#_(.)]{8,16}$'
  },
  {
    help: '邮箱',
    errorMsg: '邮箱格式有误',
    patternType: FieldStringPatternType.EMAIL,
    pattern: '^[a-z0-9A-Z]+[-|a-z0-9A-Z._]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\\\.)+[a-z]{2,}$'
  },
  {
    help: '电话',
    errorMsg: '手机号码格式有误',
    patternType: FieldStringPatternType.PHONE,
    pattern: '^(1[3-9])\\\\d{9}$'
  }
];

function registryCommonPattern() {
  CommonPatternList.forEach((_p) => {
    CommonPatternMap.set(_p.patternType, _p);
  });
}

registryCommonPattern();

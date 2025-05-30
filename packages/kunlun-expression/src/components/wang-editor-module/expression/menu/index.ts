// 定义菜单配置
import { IInsertExpressionModalMenu } from './IInsertExpressionModalMenu';

export const OioWangEditExpressionModalMenuConf = {
  key: 'OioWangEditorExpressionModal', // menu key ，唯一。注册之后，可配置到工具栏
  factory() {
    return new IInsertExpressionModalMenu();
  }
};

export * from './util';

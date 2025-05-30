export enum AppState {
  INSTALLED = 'INSTALLED',
  UNINSTALLED = 'UNINSTALLED'
}

export enum AppStateDisplayNameENum {
  UNINSTALLABLE = '不可安装',
  UNINSTALLED = '未安装',
  TOINSTALL = '安装中',
  TOUPGRADE = '升级中',
  INSTALLED = '已安装',
  TOREMOVE = '卸载中'
}

export interface ActionPermission {
  hasCreateAppAction: boolean; // 创建
  hasUpdateAppAction: boolean; // 修改
  hasUninstallAction: boolean; // 卸载
  hasInstallAction: boolean; // 安装
  hasBindHomepageAction: boolean; // 绑定首页
  hasDetailAction: boolean; // 详情

  hasLikeAction: boolean; // 收藏
  hasUnLikeAction: boolean; // 取消收藏

  hasModelDesignerAction: boolean; // 模型设计器
  hasUiDesignerAction: boolean; // 界面设计器
  hasPaasAction: boolean; // 低无一体
}

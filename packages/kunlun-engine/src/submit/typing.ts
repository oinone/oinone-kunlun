/**
 * 数据提交类型
 */
export enum SubmitType {
  /**
   * <h3>默认</h3>
   * <p>
   * 基础字段使用全量提交，关联关系字段使用关联关系提交
   * </p>
   */
  default = 'default',
  /**
   * 不提交
   */
  none = 'none',
  /**
   * 关联关系字段关系提交(仅对关联关系字段有效)
   */
  relation = 'relation',
  /**
   * 关联关系字段增量提交(仅对关联关系字段有效)
   */
  increment = 'increment',
  /**
   * 全量提交
   */
  all = 'all'
}

/**
 * 关联关系数据更新类型
 */
export enum RelationUpdateType {
  /**
   * <h3>默认</h3>
   * <p>
   * 默认根据数据提交类型进行自动识别
   * </p>
   */
  default = 'default',
  /**
   * 使用特定接口进行差量更新（关联关系字段强制使用增量提交）
   */
  diff = 'diff',
  /**
   * 使用batch接口进行差量更新（关联关系字段强制使用增量提交）
   */
  batch = 'batch',
  /**
   * 全量更新
   */
  all = 'all'
}

/**
 * 验证类型
 */
export enum SubmitVerificationType {
  /**
   * 跳过
   */
  SKIP,
  /**
   * 成功
   */
  SUCCESS,
  /**
   * 置空
   */
  SET_NULL,
  /**
   * 错误
   */
  ERROR
}

export enum RegistryType {
  FIELD = 'Field',
  VIEW = 'View',
  ACTION = 'Action'
}

export enum LifeCycleTypes {
  /**
   * View LifeCycle
   * */

  ON_VIEW_BEFORE_CREATED = 'onViewBeforeCreated', // 创建之前
  ON_VIEW_CREATED = 'onViewCreated', // 创建成功
  ON_VIEW_BEFORE_MOUNT = 'onViewBeforeMount', // 挂载前
  ON_VIEW_MOUNTED = 'onViewMounted', // 挂载成功
  ON_VIEW_BEFORE_UPDATE = 'onViewBeforeUpdate', // 修改前
  ON_VIEW_UPDATED = 'onViewUpdated', // 修改后
  ON_VIEW_ACTIVATED = 'onViewActivated',
  ON_VIEW_BEFORE_UNMOUNT = 'onViewBeforeUnmount', // 销毁前
  ON_VIEW_UNMOUNTED = 'onViewUnmounted', // 销毁

  ON_VIEW_SUBMIT = 'onViewSubmit', // 提交数据
  ON_VIEW_SUBMIT_START = 'onViewSubmitStart', // 数据提交前
  ON_VIEW_SUBMIT_END = 'onViewSubmitEnd', // 数据提交后
  ON_VIEW_SUBMIT_SUCCESS = 'onViewSubmitSuccess', // 数据提交成功
  ON_VIEW_SUBMIT_FAILED = 'onViewSubmitFailed', // 数据提交失败

  ON_VIEW_VALIDATE_START = 'onViewValidateStart', // 字段校验前
  ON_VIEW_VALIDATE_SUCCESS = 'onViewValidateSuccess', // 字段校验成功
  ON_VIEW_VALIDATE_FAILED = 'onViewValidateFailed', // 字段校验失败
  ON_VIEW_VALIDATE_END = 'onViewValidateEnd', // 字段校验结束

  /**
   * Field LifeCycle
   * */

  ON_FIELD_BEFORE_CREATED = 'onFieldBeforeCreated', // 创建之前
  ON_FIELD_CREATED = 'onFieldCreated', // 创建成功
  ON_FIELD_BEFORE_MOUNT = 'onFieldBeforeMount', // 挂载前
  ON_FIELD_MOUNTED = 'onFieldMounted', // 挂载成功
  ON_FIELD_BEFORE_UPDATE = 'onFieldBeforeUpdate', // 修改前
  ON_FIELD_UPDATED = 'onFieldUpdated', // 修改后
  ON_FIELD_ACTIVATED = 'onFieldActivated',
  ON_FIELD_BEFORE_UNMOUNT = 'onFieldBeforeUnmount', // 销毁前
  ON_FIELD_UNMOUNTED = 'onFieldUnmounted', // 销毁

  ON_FIELD_FOCUS = 'onFieldFocus', // 字段获取焦点
  ON_FIELD_CHANGE = 'onFieldChange', // 字段数据发生了改变
  ON_FIELD_BLUR = 'onFieldBlur', // 字段失焦

  ON_FIELD_VALIDATE_START = 'onFieldValidateStart', // 字段校验前
  ON_FIELD_VALIDATE_SUCCESS = 'onFieldValidateSuccess', // 字段校验成功
  ON_FIELD_VALIDATE_FAILED = 'onFieldValidateFailed', // 字段校验失败
  ON_FIELD_VALIDATE_END = 'onFieldValidateEnd' // 字段校验结束
}

/**
 * View internal event
 */
export enum ViewEventNames {
  viewBeforeCreated = LifeCycleTypes.ON_VIEW_BEFORE_CREATED,
  viewCreated = LifeCycleTypes.ON_VIEW_CREATED,
  viewBeforeMount = LifeCycleTypes.ON_VIEW_BEFORE_MOUNT,
  viewMounted = LifeCycleTypes.ON_VIEW_MOUNTED,
  viewBeforeUpdate = LifeCycleTypes.ON_VIEW_BEFORE_UPDATE,
  viewUpdated = LifeCycleTypes.ON_VIEW_UPDATED,
  viewActivated = LifeCycleTypes.ON_VIEW_ACTIVATED,
  viewBeforeUnmount = LifeCycleTypes.ON_VIEW_BEFORE_UNMOUNT,
  viewUnmounted = LifeCycleTypes.ON_VIEW_UNMOUNTED,
  viewSubmit = LifeCycleTypes.ON_VIEW_SUBMIT,
  viewSubmitStart = LifeCycleTypes.ON_VIEW_SUBMIT_START,
  viewSubmitEnd = LifeCycleTypes.ON_VIEW_SUBMIT_END,
  viewSubmitSuccess = LifeCycleTypes.ON_VIEW_SUBMIT_SUCCESS,
  viewSubmitFailed = LifeCycleTypes.ON_VIEW_SUBMIT_FAILED,
  viewValidateStart = LifeCycleTypes.ON_VIEW_VALIDATE_START,
  viewValidateSuccess = LifeCycleTypes.ON_VIEW_VALIDATE_SUCCESS,
  viewValidateFailed = LifeCycleTypes.ON_VIEW_VALIDATE_FAILED,
  viewValidateEnd = LifeCycleTypes.ON_VIEW_VALIDATE_END
}

export type ViewEventName = keyof typeof ViewEventNames;

/**
 * Field internal event
 */
export enum FieldEventNames {
  beforeCreated = LifeCycleTypes.ON_FIELD_BEFORE_CREATED,
  created = LifeCycleTypes.ON_FIELD_CREATED,
  beforeMount = LifeCycleTypes.ON_FIELD_BEFORE_MOUNT,
  mount = LifeCycleTypes.ON_FIELD_MOUNTED,
  beforeUpdate = LifeCycleTypes.ON_FIELD_BEFORE_UPDATE,
  updated = LifeCycleTypes.ON_VIEW_UPDATED,
  beforeUnmount = LifeCycleTypes.ON_FIELD_BEFORE_UNMOUNT,
  unmounted = LifeCycleTypes.ON_FIELD_UNMOUNTED,
  focus = LifeCycleTypes.ON_FIELD_FOCUS,
  change = LifeCycleTypes.ON_FIELD_CHANGE,
  blur = LifeCycleTypes.ON_FIELD_BLUR,
  validateStart = LifeCycleTypes.ON_FIELD_VALIDATE_START,
  validateSuccess = LifeCycleTypes.ON_FIELD_VALIDATE_SUCCESS,
  validateFailed = LifeCycleTypes.ON_FIELD_VALIDATE_FAILED,
  validateEnd = LifeCycleTypes.ON_FIELD_VALIDATE_END
}

export type FieldEventName = keyof typeof FieldEventNames;

import { LifeCycleTypes, RegistryType } from '../typing';
import { creatEffectHook } from './effectbox';

function createFieldEffect<V = any, C = any>(lifeType: LifeCycleTypes) {
  return creatEffectHook<V, C>(lifeType, RegistryType.FIELD);
}

/**
 * 字段生命周期 字段创建前
 */
const onFieldBeforeCreate = createFieldEffect(LifeCycleTypes.ON_FIELD_BEFORE_CREATED);

/**
 * 字段生命周期 字段已被创建
 */
const onFieldCreated = createFieldEffect(LifeCycleTypes.ON_FIELD_CREATED);

/**
 * 字段生命周期 字段挂载前
 */
const onFieldBeforeMount = createFieldEffect(LifeCycleTypes.ON_FIELD_BEFORE_MOUNT);

/**
 * 字段生命周期 字段已经挂载在页面上
 */
const onFieldMounted = createFieldEffect(LifeCycleTypes.ON_FIELD_MOUNTED);

/**
 * 字段生命周期 字段修改前
 */
const onFieldBeforeUpdate = createFieldEffect(LifeCycleTypes.ON_FIELD_BEFORE_UPDATE);

/**
 * 字段生命周期 字段已被修改
 */
const onFieldUpdated = createFieldEffect(LifeCycleTypes.ON_FIELD_UPDATED);

/**
 * 字段生命周期 字段销毁前
 */
const onFieldBeforeUnmount = createFieldEffect(LifeCycleTypes.ON_FIELD_BEFORE_UNMOUNT);

/**
 * 字段生命周期 字段已被销毁
 */
const onFieldUnmounted = createFieldEffect(LifeCycleTypes.ON_FIELD_UNMOUNTED);

/**
 * 字段生命周期 单字段校验  校验开始
 */
const onFieldValidateStart = createFieldEffect(LifeCycleTypes.ON_FIELD_VALIDATE_START);

/**
 * 字段生命周期 单字段校验  校验成功
 */
const onFieldValidateSuccess = createFieldEffect(LifeCycleTypes.ON_FIELD_VALIDATE_SUCCESS);

/**
 * 字段生命周期 单字段校验  校验失败
 */
const onFieldValidateFailed = createFieldEffect(LifeCycleTypes.ON_FIELD_VALIDATE_FAILED);

/**
 * 字段生命周期 单字段校验  校验结束
 */
const onFieldValidateEnd = createFieldEffect(LifeCycleTypes.ON_FIELD_VALIDATE_END);

/**
 * 字段生命周期 字段获得焦点
 */
const onFieldFocus = createFieldEffect(LifeCycleTypes.ON_FIELD_FOCUS);

/**
 * 字段生命周期 字段的值发生的修改（只有该字段发生了change方法才会触发，否则不触发）
 */
const onFieldValueChange = createFieldEffect(LifeCycleTypes.ON_FIELD_CHANGE);

/**
 * 字段生命周期 字段失去焦点
 */
const onFieldBlur = createFieldEffect(LifeCycleTypes.ON_FIELD_BLUR);

export {
  onFieldBeforeCreate,
  onFieldCreated,
  onFieldBeforeMount,
  onFieldMounted,
  onFieldBeforeUpdate,
  onFieldUpdated,
  onFieldBeforeUnmount,
  onFieldUnmounted,
  onFieldValidateStart,
  onFieldValidateSuccess,
  onFieldValidateFailed,
  onFieldValidateEnd,
  onFieldFocus,
  onFieldValueChange,
  onFieldBlur
};

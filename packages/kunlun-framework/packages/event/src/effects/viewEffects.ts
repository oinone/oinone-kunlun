import { LifeCycleTypes, RegistryType } from '../typing';
import { creatEffectHook } from './effectbox';

function createViewEffect<V = any, C = any>(lifeType: LifeCycleTypes) {
  return creatEffectHook<V, C>(lifeType, RegistryType.VIEW);
}

/**
 * 视图生命周期 视图创建前
 */
const onViewBeforeCreated = createViewEffect(LifeCycleTypes.ON_VIEW_BEFORE_CREATED);

/**
 * 视图生命周期 视图已被创建
 */
const onViewCreated = createViewEffect(LifeCycleTypes.ON_VIEW_CREATED);

/**
 * 视图生命周期 视图挂载前
 */
const onViewBeforeMount = createViewEffect(LifeCycleTypes.ON_VIEW_BEFORE_MOUNT);

/**
 * 视图生命周期 视图已经挂载在页面上
 */
const onViewMounted = createViewEffect(LifeCycleTypes.ON_VIEW_MOUNTED);

/**
 * 视图生命周期 视图修改前
 */
const onViewBeforeUpdate = createViewEffect(LifeCycleTypes.ON_VIEW_BEFORE_UPDATE);

/**
 * 视图生命周期 视图已被修改
 */
const onViewUpdated = createViewEffect(LifeCycleTypes.ON_VIEW_UPDATED);

/**
 * 视图生命周期 视图销毁前
 */
const onViewBeforeUnmount = createViewEffect(LifeCycleTypes.ON_VIEW_BEFORE_UNMOUNT);

/**
 * 视图生命周期 视图已被销毁
 */
const onViewUnmounted = createViewEffect(LifeCycleTypes.ON_VIEW_UNMOUNTED);

/**
 * 视图生命周期 视图数据提交
 */
const onViewSubmit = createViewEffect(LifeCycleTypes.ON_VIEW_SUBMIT);

/**
 * 视图生命周期 视图数据开始提交
 */
const onViewSubmitStart = createViewEffect(LifeCycleTypes.ON_VIEW_SUBMIT_START);

/**
 * 视图生命周期 视图数据提交成功
 */
const onViewSubmitSuccess = createViewEffect(LifeCycleTypes.ON_VIEW_SUBMIT_SUCCESS);

/**
 * 视图生命周期 视图数据提交失败
 */
const onViewSubmitFailed = createViewEffect(LifeCycleTypes.ON_VIEW_SUBMIT_FAILED);

/**
 * 视图生命周期 视图数据提交结束
 */
const onViewSubmitEnd = createViewEffect(LifeCycleTypes.ON_VIEW_SUBMIT_END);

/**
 * 视图生命周期 视图开始校验，只有表单页才会触发
 */
const onViewValidateStart = createViewEffect(LifeCycleTypes.ON_VIEW_VALIDATE_START);

/**
 * 视图生命周期 视图校验成功，只有表单页才会触发
 */
const onViewValidateSuccess = createViewEffect(LifeCycleTypes.ON_VIEW_VALIDATE_SUCCESS);

/**
 * 视图生命周期 视图校验失败，只有表单页才会触发
 */
const onViewValidateFailed = createViewEffect(LifeCycleTypes.ON_VIEW_VALIDATE_FAILED);

/**
 * 视图生命周期 视图校验结束，只有表单页才会触发
 */
const onViewValidateEnd = createViewEffect(LifeCycleTypes.ON_VIEW_VALIDATE_END);

export {
  onViewBeforeCreated,
  onViewCreated,
  onViewBeforeMount,
  onViewMounted,
  onViewBeforeUpdate,
  onViewUpdated,
  onViewBeforeUnmount,
  onViewUnmounted,
  onViewSubmit,
  onViewSubmitStart,
  onViewSubmitSuccess,
  onViewSubmitFailed,
  onViewSubmitEnd,
  onViewValidateStart,
  onViewValidateSuccess,
  onViewValidateFailed,
  onViewValidateEnd
};

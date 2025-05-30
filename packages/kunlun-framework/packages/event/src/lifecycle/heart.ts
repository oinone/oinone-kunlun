import { isStr } from '../helper';
import { LifeCycle } from './lifecycle';
import { LifeCycleTypes, RegistryType } from '../typing';

/**
 * HeartLifeCycles = [{
 *  registryType: Field,
 *  type: onFieldChange,
 *  pattern: {
 *    identifier: displayName
 *    lifes: [LifeCycle]
 *  }
 * }]
 */

type HeartLifeCycles = {
  type: LifeCycleTypes;
  registryType: RegistryType;
  pattern: {
    identifier: string;
    lifes: LifeCycle[];
  }[];
}[];

/**
 * 操作生命周期的api
 */
class LifeCycleHeart {
  private static lifeCycles: HeartLifeCycles = [];

  private static heartType: RegistryType | null = null;

  static initialize(lifeCycles: HeartLifeCycles) {
    this.lifeCycles = lifeCycles;
  }

  private static getLifeCycleIndex(type: LifeCycleTypes) {
    return this.lifeCycles.findIndex((l) => l.type === type);
  }

  static getLifeCycle() {
    return this.lifeCycles;
  }

  static getLifeCycleByType(type: LifeCycleTypes) {
    const index = this.getLifeCycleIndex(type);

    if (index >= 0) {
      return this.lifeCycles[index];
    }

    return null;
  }

  /**
   * 设置生命周期的注册类型,
   *
   * @param {registryType} RegistryType 类型
   */
  static setType(registryType: RegistryType) {
    this.heartType = registryType;
  }

  /**
   * 设置生命周期
   * 调用该函数之前要先调用 `setType` 设置注册类型
   *
   * @param {type} LifeCycleTypes 生命周期的类型
   * @param {identifier} string 唯一标识符
   * @param {lifeCycle} LifeCycle 生命周期的实例
   *
   */
  static setLifeCycle(type: LifeCycleTypes, identifier: string, lifeCycle: LifeCycle) {
    if (!isStr(type) || !isStr(identifier) || !(lifeCycle instanceof LifeCycle)) {
      return false;
    }

    if (!this.heartType) {
      throw new Error(`set fail, use "LifeCycleHeart.setType(type)" first, then call "setLifeCycle"`);
    }

    const index = this.getLifeCycleIndex(type);

    if (index >= 0) {
      if (identifier) {
        this.lifeCycles[index].pattern.push({
          identifier,
          lifes: [lifeCycle]
        });
      }
    } else {
      this.lifeCycles.push({
        type,
        registryType: this.heartType,
        pattern: [
          {
            identifier,
            lifes: [lifeCycle]
          }
        ]
      });
    }

    this.heartType = null;
  }

  /**
   * 触发生命周期的回调函数
   *
   * @param {type} LifeCycleTypes 生命周期的类型
   * @param {identifier} string 唯一标识符
   * @param {ctx} Context 当前「视图/字段/Action」的上下文
   */
  static publish<C = any>(type: LifeCycleTypes, identifier: string, ctx: C) {
    if (!type || !identifier || !ctx) {
      return false;
    }

    const index = this.getLifeCycleIndex(type);

    if (index >= 0 && identifier) {
      const pattern = this.lifeCycles[index].pattern.find((p) => p.identifier === identifier);
      if (pattern) {
        pattern.lifes.forEach((l) => {
          l.notify(ctx);
        });
      }
    }
  }

  /**
   * @deprecated 销毁生命周期
   *
   * @param {identifier} string 唯一标识符
   */
  static disposeLifeCycle(identifier: string) {
    // this.lifeCycles.forEach((life) => {
    //   const index = life.pattern.findIndex((l) => l.identifier === identifier);
    //   if (index >= 0) {
    //     life.pattern.splice(index, 1);
    //   }
    // });
  }

  /**
   * 销毁生命周期
   *
   * @param {identifier} string 唯一标识符
   */
  static dispose(identifier: string) {
    this.lifeCycles.forEach((life) => {
      const index = life.pattern.findIndex((l) => l.identifier === identifier);
      if (index >= 0) {
        life.pattern.splice(index, 1);
      }
    });
  }
}

export { LifeCycleHeart };

import { Optional } from '@oinone/kunlun-shared';
import { clearTriggerDirective, isUsingTriggerDirective, TriggerDirective, useTriggerDirective } from './directive';

let activeEffect: ReactiveEffect | undefined;

let activeRunArguments: unknown[] | undefined;

let effectTrackDepth = 0;

let trackOpBit = 1;

const maxMarkerBits = 30;

/**
 * 影响调度函数
 */
export type EffectScheduler = (...args: any[]) => void;

/**
 * 空调度函数
 */
const EMPTY_SCHEDULER: EffectScheduler = (): void => {};

/**
 * 响应影响对象
 */
export class ReactiveEffect {
  /**
   * 是否激活
   * @private
   */
  private active = true;

  /**
   * 是否在运行结束后停止
   * @private
   */
  private deferStop = false;

  /**
   * 动态响应对象
   */
  public parent: ReactiveEffect | undefined;

  /**
   * 影响依赖
   */
  public readonly deps: EffectDep[] = [];

  /**
   * 调度函数
   */
  public readonly scheduler: EffectScheduler | undefined;

  public constructor(scheduler?: EffectScheduler) {
    this.scheduler = scheduler;
  }

  /**
   * 触发调度执行函数
   * @param args 触发参数
   */
  public run(...args: unknown[]) {
    if (!this.active) {
      return;
    }
    let parent: ReactiveEffect | undefined = activeEffect;
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    const lastedActiveRunArguments = activeRunArguments;
    try {
      this.parent = activeEffect;
      activeEffect = this;
      activeRunArguments = args;

      trackOpBit = 1 << ++effectTrackDepth;

      // if (effectTrackDepth <= maxMarkerBits) {
      //   EffectDepManager.initDepMarkers(this);
      // } else {
      //   EffectDepManager.cleanupEffect(this);
      // }
      //   this.executeScheduler(args);

      if (effectTrackDepth <= maxMarkerBits) {
        EffectManager.scheduler(this, args);
      }
    } finally {
      // if (effectTrackDepth <= maxMarkerBits) {
      //   EffectDepManager.finalizeDepMarkers(this);
      // }

      trackOpBit = 1 << --effectTrackDepth;

      activeEffect = this.parent;
      activeRunArguments = lastedActiveRunArguments;
      this.parent = undefined;

      if (this.deferStop) {
        this.stop();
      }
    }
  }

  /**
   * 停止调度并移除所有影响依赖
   */
  public stop() {
    if (activeEffect === this) {
      this.deferStop = true;
    } else if (this.active) {
      EffectDepManager.cleanupEffect(this);
      this.active = false;
    }
  }
}

/**
 * 响应影响运行器
 */
export type ReactiveEffectRunner = {
  (): void;
  effect: ReactiveEffect;
};

/**
 * 影响追踪可选项
 */
export interface EffectTrackOptions {
  /**
   * 是否双工
   */
  duplex?: boolean;
  /**
   * 受影响变更对象
   */
  effect?: ReactiveEffect;
  /**
   * 延迟调度，阻止首次追踪时执行调度函数
   */
  lazy?: boolean;
  /**
   * 强制调度，多次重复追踪时执行调度函数
   */
  force?: boolean;
}

/**
 * Effect Manager, support track/trigger
 */
export class EffectManager {
  private static readonly root = new ReactiveEffect();

  private static readonly targetMap = new WeakMap<EffectScheduler, ReactiveEffectRunner>();

  private constructor() {
    // reject create object
  }

  /**
   * 是否正在追踪
   */
  public static isTracking(): boolean {
    return activeEffect != null;
  }

  public static getActiveEffect(): ReactiveEffect | undefined {
    return activeEffect;
  }

  /**
   * 创建一个响应影响运行器，并建立影响依赖
   * @param fn 调度函数
   * @param options 影响追踪可选项
   */
  public static track(fn: EffectScheduler, options?: EffectTrackOptions): ReactiveEffectRunner {
    const lastActiveEffect = activeEffect;

    activeEffect = options?.effect || activeEffect || EffectManager.root;

    let runner = EffectManager.targetMap.get(fn);
    let dep: EffectDep | undefined;
    if (runner) {
      if (EffectManager.needRebuildEffect(activeEffect.deps, fn)) {
        dep = EffectDepManager.createDep();
        activeEffect.deps.push(dep);
        const temporaryActiveEffect = activeEffect;
        activeEffect = runner.effect;
        EffectManager.trackEffects(dep);
        activeEffect = temporaryActiveEffect;
      }

      if (options?.force) {
        runner();
      }
    } else {
      runner = EffectManager.createEffect(fn);
      dep = EffectDepManager.createDep();
      activeEffect.deps.push(dep);

      const temporaryActiveEffect = activeEffect;
      activeEffect = runner.effect;
      EffectManager.trackEffects(dep);
      activeEffect = temporaryActiveEffect;

      EffectManager.targetMap.set(fn, runner);

      if (
        Optional.ofNullable(options)
          .map((v) => v.duplex)
          .orElse(true)
      ) {
        dep = EffectDepManager.createDep();
        runner.effect.deps.push(dep);
        EffectManager.trackEffects(dep);
      }

      if (!options || !options.lazy) {
        runner();
      }
    }

    activeEffect = lastActiveEffect;

    return runner;
  }

  public static createEffect(fn: EffectScheduler | undefined): ReactiveEffectRunner {
    const effect = new ReactiveEffect(fn);

    const runner = (effect.scheduler || EMPTY_SCHEDULER).bind(effect) as ReactiveEffectRunner;
    runner.effect = effect;
    return runner;
  }

  private static needRebuildEffect(deps: EffectDep[], fn: EffectScheduler) {
    return !deps.some((dep) => {
      return [...dep].some((v) => v.scheduler === fn);
    });
  }

  private static trackEffects(dep: EffectDep) {
    if (!activeEffect) {
      return;
    }
    let shouldTrack = false;
    if (effectTrackDepth <= maxMarkerBits) {
      if (!EffectDepManager.newTracked(dep)) {
        dep.n |= trackOpBit;
        shouldTrack = !EffectDepManager.wasTracked(dep);
      }
    } else {
      shouldTrack = !dep.has(activeEffect);
    }
    if (shouldTrack) {
      dep.add(activeEffect);
    }
  }

  /**
   * 触发响应影响调度
   * @param target 响应影响对象
   * @param args 触发参数
   */
  public static trigger(target: ReactiveEffect, ...args: unknown[]) {
    target.run(...args);
  }

  /**
   * 使用指令触发响应影响调度
   * @param target 响应影响对象
   * @param directive 指令
   * @param args 触发参数
   */
  public static triggerWithDirective(target: ReactiveEffect, directive: number, ...args: unknown[]) {
    useTriggerDirective(directive, () => {
      target.run(...args);
    });
  }

  private static triggerDeps(effect: ReactiveEffect, ...args) {
    const deps: EffectDep[] = [...effect.deps];
    if (deps.length === 1) {
      EffectManager.triggerEffects(deps[0], args);
    } else {
      const effects: ReactiveEffect[] = [];
      deps.forEach((dep) => {
        effects.push(...dep);
      });
      EffectManager.triggerEffects(EffectDepManager.createDep(effects), args);
    }
  }

  private static triggerEffects(deps: EffectDep | ReactiveEffect[], args: unknown[]) {
    const effects = Array.isArray(deps) ? deps : [...deps];
    effects
      .filter((effect) => !!effect.scheduler)
      .forEach((effect) => {
        EffectManager.triggerEffect(effect, args);
      });
  }

  private static triggerEffect(effect: ReactiveEffect, args: unknown[]) {
    if (effect === activeEffect) {
      return;
    }
    effect.run(...args);
  }

  public static scheduler(effect: ReactiveEffect, args: unknown[]) {
    const { scheduler } = effect;
    if (!scheduler) {
      return;
    }
    if (
      isUsingTriggerDirective(TriggerDirective.FORCE_THIS) ||
      !isUsingTriggerDirective(TriggerDirective.IGNORED_THIS)
    ) {
      scheduler(...args);
    }
    if (
      isUsingTriggerDirective(TriggerDirective.FORCE_DEPS) ||
      !isUsingTriggerDirective(TriggerDirective.IGNORED_DEPS)
    ) {
      clearTriggerDirective(TriggerDirective.IGNORED_THIS | TriggerDirective.IGNORED_DEPS, () => {
        EffectManager.triggerDeps(effect, ...args);
      });
    }
  }

  public static triggerActiveEffectDeps() {
    if (activeEffect && activeRunArguments) {
      EffectManager.triggerDeps(activeEffect, ...activeRunArguments);
    }
  }
}

/**
 * 影响依赖
 * <p>
 * key -> `${field#data}#${field#__index}`
 * </p>
 * <p>
 * value -> {@link ReactiveEffect}
 * </p>
 */
export type EffectDep = Set<ReactiveEffect> & TrackedMarkers;

/**
 * 追踪标记
 */
type TrackedMarkers = {
  /**
   * wasTracked
   */
  w: number;
  /**
   * newTracked
   */
  n: number;
};

/**
 * Dep Manager
 *
 * @see vue-next/reactivity/dep.ts
 */
export class EffectDepManager {
  private constructor() {
    // reject create object
  }

  public static createDep(effects?: ReactiveEffect[]): EffectDep {
    const dep = new Set<ReactiveEffect>(effects) as EffectDep;
    dep.w = 0;
    dep.n = 0;
    return dep;
  }

  public static wasTracked(dep: EffectDep): boolean {
    return (dep.w & trackOpBit) > 0;
  }

  public static newTracked(dep: EffectDep): boolean {
    return (dep.n & trackOpBit) > 0;
  }

  public static initDepMarkers({ deps }: ReactiveEffect) {
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].w |= trackOpBit;
      }
    }
  }

  public static finalizeDepMarkers(effect: ReactiveEffect) {
    const { deps } = effect;
    if (deps.length) {
      let ptr = 0;
      for (let i = 0; i < deps.length; i++) {
        const dep = deps[i];
        if (EffectDepManager.wasTracked(dep) && !EffectDepManager.newTracked(dep)) {
          dep.delete(effect);
        } else {
          deps[ptr++] = dep;
        }
        dep.w &= ~trackOpBit;
        dep.n &= ~trackOpBit;
      }
      deps.length = ptr;
    }
  }

  /**
   * 清除响应影响依赖
   * @param effect 响应影响对象
   */
  public static cleanupEffect(effect: ReactiveEffect) {
    const { deps } = effect;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
      }
      deps.length = 0;
    }
  }
}

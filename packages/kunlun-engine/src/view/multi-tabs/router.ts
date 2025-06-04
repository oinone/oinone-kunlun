import { getRouterInstance, Router } from '@oinone/kunlun-router';
import { isString } from 'lodash-es';
import { BackRouter, ForwardRouter } from '../../router/typing';
import { MultiTabsHelper } from './helper';
import { MultiTabsManager } from './manager';
import { MultiTabInstance, MultiTabStackItem } from './typing';

/**
 * 多标签页路由
 */
export class MultiTabsRouter implements BackRouter, ForwardRouter {
  private router: Router;

  private constructor(router: Router) {
    this.router = router;
  }

  public static useRouter(router?: Router) {
    if (!router) {
      router = getRouterInstance();
    }
    return new MultiTabsRouter(router);
  }

  /**
   * 跳转到指定标签页
   * @param instanceOrKey 标签页实例或唯一键
   */
  public to(instanceOrKey: string | MultiTabInstance) {
    this.operator(instanceOrKey, (instance) => {
      const currentStack = instance.stack;
      const lastedStackItem = currentStack[currentStack.length - 1];
      this.$to(lastedStackItem);
    });
  }

  /**
   * 在标签页内返回
   */
  public async back() {
    const activeInstance = MultiTabsManager.INSTANCE.getActiveTab();
    if (!activeInstance) {
      console.error('Invalid active tab.');
      return;
    }
    const { key, stack } = activeInstance;
    const drawbackStackItem = stack[stack.length - 2];
    if (drawbackStackItem) {
      await this.$to(drawbackStackItem);
    } else {
      MultiTabsManager.INSTANCE.refresh(key);
    }
  }

  /**
   * 在标签页内前进
   */
  public forward() {
    throw new Error('Invalid forward method');
  }

  private operator(instanceOrKey: string | MultiTabInstance, fn: (instance: MultiTabInstance) => void) {
    let instance: MultiTabInstance | undefined;
    if (isString(instanceOrKey)) {
      instance = MultiTabsManager.INSTANCE.getTab(instanceOrKey);
    } else {
      instance = instanceOrKey;
    }
    if (instance) {
      fn(instance);
    } else {
      console.error('Invalid tab instance.');
    }
  }

  private async $to(stackItem: MultiTabStackItem) {
    this.router.push({
      segments: [
        {
          path: 'page',
          extra: { preserveParameter: false },
          parameters: await MultiTabsHelper.generatorParameters(stackItem)
        }
      ]
    });
  }
}

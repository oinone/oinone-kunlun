import { h, Suspense, VNode, SetupContext } from 'vue';
import { SetupHook, VueWidget } from './VueWidget';

export class AsyncVueWidget extends VueWidget {
  public setup(setupHook?: SetupHook) {
    const setupFunction = super.setup();
    return async (ctx: void, props?: unknown) => {
      const result = setupFunction(ctx, props);
      const hookResult: Record<string, unknown> = ((setupHook && (await setupHook(ctx, props))) || {}) as Record<
        string,
        unknown
      >;
      for (const key in hookResult) {
        Reflect.set(result, key, Reflect.get(hookResult, key));
      }
      return result;
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public render(ctx?: SetupContext | any): VNode {
    return h('div', h(Suspense, super.render(ctx) as VNode));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async setupHook(_ctx: void, _props: unknown, _result: unknown): Promise<unknown> {
    await this.beforeCreated();
    await this.created();
    return {};
  }
}

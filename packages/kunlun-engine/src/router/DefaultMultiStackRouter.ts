import { MultiStackRouter, StackStores } from './typing';

export class DefaultMultiStackRouter implements MultiStackRouter {
  public static INSTANCE = new DefaultMultiStackRouter();

  private stacks: StackStores = [];

  private activeKey: string | undefined;

  public push(url: string) {}

  public back() {
    window.history.back();
  }

  public forward() {
    window.history.forward();
  }

  public isForce() {
    return false;
  }

  public getActiveKey(): string | undefined {
    return this.activeKey;
  }

  public getCurrentStack(): string[] {
    const { activeKey, stacks } = this;
    if (!activeKey) {
      throw new Error('Invalid active key');
    }
    const currentStack = stacks[activeKey];
    if (!currentStack) {
      throw new Error('Invalid current stack');
    }
    return [...currentStack];
  }

  public getAllStacks() {
    return this.stacks.map((v) => {
      return {
        ...v,
        stack: [...v.stack]
      };
    });
  }
}

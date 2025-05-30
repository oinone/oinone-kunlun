import { SingleStackRouter, StackStore } from './typing';

export class DefaultSingleStackRouter implements SingleStackRouter {
  public static INSTANCE = new DefaultSingleStackRouter();

  private stack: StackStore = [];

  private currentIndex = -1;

  public push(url: string, go = false) {
    const { stack, currentIndex } = this;
    if (currentIndex === -1) {
      stack.push(url);
      this.currentIndex = 0;
      return;
    }
    if (currentIndex !== stack.length - 1) {
      stack.splice(currentIndex, stack.length - 2);
    }
    stack.push(url);
    this.currentIndex = stack.length - 1;
    if (go) {
      window.history.pushState(null, '', url);
    }
  }

  public back(): void {
    const { stack, currentIndex } = this;
    const targetIndex = currentIndex - 1;
    const targetUrl = stack[targetIndex];
    if (!targetUrl) {
      return;
    }
    this.currentIndex = targetIndex;
    window.history.replaceState(null, '', targetUrl);
  }

  public forward(): void {
    const { stack, currentIndex } = this;
    const targetIndex = currentIndex + 1;
    const targetUrl = stack[targetIndex];
    if (!targetUrl) {
      return;
    }
    this.currentIndex = targetIndex;
    window.history.replaceState(null, '', targetUrl);
  }
}

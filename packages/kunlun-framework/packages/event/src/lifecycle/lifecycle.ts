import { isFn } from '../helper';

type LifeCyclePayload<Context = any> = (context: Context) => void;

class LifeCycle<Context = any> {
  private listener!: LifeCyclePayload<Context>;

  constructor(callback?: (ctx: Context) => void) {
    if (!isFn(callback)) {
      throw new Error('life cycle callback must be function');
    }

    this.listener = this.buildListener(callback);
  }

  private buildListener(callback?: Function): LifeCyclePayload {
    return (ctx?: Context) => {
      if (isFn(callback)) {
        callback(ctx);
      }
    };
  }

  public notify(ctx: Context) {
    this.listener.call(ctx, ctx);
  }
}

export { LifeCycle };

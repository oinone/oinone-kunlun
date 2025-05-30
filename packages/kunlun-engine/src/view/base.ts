import { DataValue, IBaseVMProps } from '../typing';

/**
 * BaseVM 管理所有的上下文，视图、字段等都要从这里开始。
 */
export abstract class BaseVM<IValue extends DataValue, ParentVM extends BaseVM<IValue> = any> {
  constructor(initializer: IBaseVMProps) {
    const { parent } = initializer;
    this.id = `$$vm${BaseVM.id++}`;

    this.parent = parent;
    this.parent?.children.push(this);
  }

  private static id = 0;

  public id: string = '';

  protected parent?: ParentVM;

  public children: ParentVM[] = [];

  protected viewData!: IValue;

  public getParent() {
    return this.parent;
  }

  public getChildren() {
    return this.children;
  }

  public dispose() {
    this.children = [];
  }
}

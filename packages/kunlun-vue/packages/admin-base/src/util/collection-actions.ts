import { isDev } from '@oinone/kunlun-router';
import { isArray } from 'lodash-es';
import { VNode } from 'vue';
import { InternalWidget } from '../tags';
import { VNodeHelper } from './VNodeHelper';

export class CollectionActions {
  public hasMore = false;

  public showActionCount = 0;

  public showActions: VNode[] = [];

  public showActionFlags: boolean[] = [];

  public moreActions: VNode[] = [];

  public moreActionFlags: boolean[] = [];

  public otherVNodes: VNode[] = [];

  public showActionNames: string[] | undefined;

  public activeCount: number;

  public constructor(showActionNames: string[] | undefined, activeCount: number) {
    this.showActionNames = showActionNames;
    this.activeCount = activeCount;
  }

  public do(vnodes: VNode[]) {
    for (const vnode of vnodes) {
      if (VNodeHelper.isFragment(vnode)) {
        const fragmentChildren = vnode.children;
        if (isArray(fragmentChildren)) {
          if (!this.do(vnode.children as VNode[])) {
            return false;
          }
        }
      } else if ((vnode.type as { name: string })?.name?.toLowerCase?.() === InternalWidget.Action) {
        let isShow = true;
        if (this.showActionNames) {
          const actionName = vnode.props?.dslDefinition?.name;
          if (actionName) {
            isShow = this.showActionNames.some((v) => v === actionName);
          }
        }
        if (this.activeCount <= -1) {
          this.showActions.push(vnode);
          this.showActionFlags.push(isShow);
        } else if (this.showActionCount < this.activeCount) {
          this.showActions.push(vnode);
          this.showActionFlags.push(isShow);
        } else {
          this.hasMore = true;
          this.moreActions.push(vnode);
          this.moreActionFlags.push(isShow);
        }
        if (isShow) {
          this.showActionCount++;
        }
      } else {
        this.otherVNodes.push(vnode);
        if (isDev()) {
          console.warn('无法识别的标签类型', vnode);
          this.hasMore = false;
          return false;
        }
      }
    }
    return true;
  }
}

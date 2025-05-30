import { isString } from 'lodash-es';
import { VNode } from 'vue';

const fragmentVNodeTypes = ['Symbol(Fragment)', 'Symbol()'];

export class VNodeHelper {
  public static isFragment(vnode: VNode) {
    const s = vnode?.type?.toString?.();
    if (isString(s)) {
      return fragmentVNodeTypes.includes(s);
    }
    return false;
  }
}

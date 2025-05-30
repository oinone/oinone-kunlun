export interface FrameworkInstance {
  app: FrameworkApplication;
  currentInstance?: FrameworkComponentInstance | null;
}

export interface FrameworkApplication {
  id: string;
}

export interface FrameworkComponentInstance {
  vNode: FrameworkVNode;
}

export interface FrameworkVNode {
  el: HTMLElement;
}

export type FrameworkInstanceGetter = () => FrameworkInstance;

import { ContextNode } from '@oinone/kunlun-shared';

export interface RuntimeEnvironment extends ContextNode<RuntimeEnvironment> {
  contentSelector: string;

  mcx: number;
  mcy: number;
  st: number;
  sl: number;

  contentVisibleArea: VisibleArea;
  visibleArea: Map<string, VisibleArea>;
  clickVisibleArea: VisibleArea[];

  getContentHTMLElement(): HTMLElement | undefined;
}

export interface VisibleArea {
  handle: string;
  el?: HTMLElement;
  h: number;
  w: number;
  x: number;
  y: number;
  ex: number;
  ey: number;
}

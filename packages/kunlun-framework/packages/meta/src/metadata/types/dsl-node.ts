export interface IDslNode extends Record<string, unknown> {
  name?: string;
  children: IDslNode[];
  tagName: string;
  widget?: string;
  confirm?: string;
  // 最末级标签内的文本内容，如：<span>hello</span>就是获取hello
  textContent?: string;
  [key: string]: any;
}

export interface IDslTree {
  root: IDslNode;
}

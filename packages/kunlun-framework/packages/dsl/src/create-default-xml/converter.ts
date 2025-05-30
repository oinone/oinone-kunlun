const kebabCase = (str: string) => {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)!
    .filter(Boolean)
    .map((x) => x.toLowerCase())
    .join('-');
};

interface IDslNode {
  id: string;
  name: string;
  tag: string;
  props: { [key: string]: any };
  attrs: { [key: string]: any };
  parent: IDslNode | null;
  children: IDslNode[];
  element: any;
  __meta: { [key: string]: any };
  attach: (el: any) => void;
  getMeta: (key: string) => any;
  setMeta: (key: string, value: any) => void;
}

/**
 * 过滤掉无效属性
 *
 * 1. `undefined` 和 `null`
 * 2. 不包含在指定元素的属性描述符中的
 *
 * @param ns 命名空间
 * @param props 属性
 * @param nodeName 元素名
 */
function filterInvalidProps(ns: string, props: any, nodeName?: string) {
  const toBeProps: string[] = [];
  const toBeAttrs: string[] = [];

  Object.keys(props || {}).forEach((k: string) => {
    if (props[k] != null) {
      toBeAttrs.push(k);
    }
  });

  return { props: toBeProps, attrs: toBeAttrs };
}

function convertPropsToAttrs(propKeys: string[], props: any): string {
  return propKeys.map((k: string) => `${kebabCase(k)}="${props[k]}"`).join(' ');
}

/**
 * 获取模板元素属性字符串
 *
 * @param ns 命名空间
 * @param node 节点
 */
function resolveTemplateAttributes(ns: string, node: Partial<IDslNode>): string {
  const { props: propKeys, attrs: attrKeysFromProps } = filterInvalidProps(ns, node.props!, node.name);

  return [
    convertPropsToAttrs([...propKeys, ...attrKeysFromProps], node.props!),
    convertPropsToAttrs(
      Object.keys(node.attrs! || {}).filter((k: string) => k != null),
      node.attrs!
    )
  ]
    .filter((s: string) => s !== '')
    .join(' ');
}

/**
 * 将节点转换为模板
 *
 * @param node 节点
 * @param dsl `DslResolver` 实例
 */
function convertToTemplate(node: Partial<IDslNode>, dsl?: any): string {
  const ns = (node.__meta || {}).namespace || '';

  const tagName = kebabCase(node.tag as string);
  const attrs = resolveTemplateAttributes(ns, node);

  const content = ([] as any[])
    .concat(node.children || [])
    .map((n: any): string => convertToTemplate(n, dsl))
    .join('');

  return content ? `<${tagName} ${attrs}>${content}</${tagName}>` : `<${tagName} ${attrs} />`;
}

export { convertToTemplate };

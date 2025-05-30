import {
  ActionType,
  IAction,
  IClientAction,
  ICompositionAction,
  IModel,
  IModelField,
  ModelFieldType,
  ElementType,
  IDslNode,
  IDslTree
} from '@kunlun/meta';
import { getDefaultFieldRenderType } from '../create-default-xml/field';

const ModelFieldTypeValues = Object.values(ModelFieldType);
export type BlockInfo = { name?: string; children?: string };

/**
 * @deprecated XMLParse
 */
export class XMLTemplateParser {
  public static parser = new DOMParser();

  /**
   *  将xml解析成 dsl
   *
   * @param  {string} template?
   * @returns {IDslTree}
   */
  public parser(template?: string): IDslTree {
    if (template) {
      try {
        const root = XMLTemplateParser.parser.parseFromString(template, 'text/xml');
        const result = { root: this.xml2dsl(root.children[0]) };
        return result;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
    return {} as IDslTree;
  }

  /**
   * 获取指定 tagName 的 dsl
   *
   * @param  {IDslNode} dslNode
   * @param  {string} tagName
   * @returns {Array<IDslNode>}
   */
  public findDslByTagName(dslNode: IDslNode, tagName: string): IDslNode[] {
    let res: IDslNode[] = [];

    if (dslNode.tagName === tagName) {
      res.push(dslNode);
    }

    if (dslNode.children && dslNode.children.length) {
      dslNode.children.forEach((node) => {
        const child = this.findDslByTagName(node, tagName);
        res = res.concat(child);
      });
    }

    return res;
  }

  /**
   * 判断xml中有没有key -> value的节点
   *
   * @param  {string} key
   * @param  {string} value
   * @param  {string} template
   *
   * @example
   *
   * const xml = `<view>
   *  <field widget="code"></field>
   *  <field widget="name"></field>
   * </view>`
   *
   * hasKeyValueOrNot('widget', 'code', xml)
   *
   * @returns {boolean}
   */
  public hasKeyValueOrNot(key: string, value: string, template: string) {
    const dslNode = this.parser(template);
    return this.findKey(dslNode, key, value);
  }

  public findKey(dslNode: any, key: string, value: string) {
    for (const d in dslNode) {
      if (d === 'children' || dslNode[d] instanceof Array) {
        for (let i = 0; i < dslNode[d].length; i++) {
          if (this.findKey(dslNode[d][i], key, value)) {
            return true;
          }
        }
      } else if (d === key) {
        if (dslNode[d] === value) {
          return true;
        }
      } else if (typeof dslNode[d] === 'object') {
        if (this.findKey(dslNode[d], key, value)) {
          return true;
        }
      }
    }
    return false;
  }

  public xml2dsl(node: Element): IDslNode {
    const result = {} as IDslNode;
    if (node.tagName === 'parsererror') {
      console.log('part of xml was parser error', node);
      return result;
    }
    result.children = [];
    result.tagName = node.tagName.toUpperCase();
    if (node.children.length === 0) {
      result.textContent = node.textContent || '';
    }
    for (let i = 0; i < node.attributes.length; i++) {
      const item = node.attributes.item(i)!;
      const name = item.name;
      // eslint-disable-next-line prefer-destructuring
      let value: unknown = item.value;
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      result[name] = value;
    }
    if (result.tagName === 'FIELD' || result.tagName === 'WIDGET') {
      // 兼容v2只有name的情况
      result.data = !result.data ? result.name : result.data;
    }
    for (let i = 0; i < node.children.length; i++) {
      result.children.push(this.xml2dsl(node.children.item(i)!));
    }
    return result;
  }

  public static createDslField(fieldNode: IDslNode, field: IModelField & { node?: IDslNode }): IModelField {
    field.node = fieldNode;
    const name = (fieldNode.data as string) || field.name;
    const ttype = (fieldNode.ttype as ModelFieldType) || field.ttype;
    const widget = fieldNode.widget || field.widget || getDefaultFieldRenderType(field);
    // TODO 开发模式才判断
    if (!ModelFieldTypeValues.includes(ttype)) {
      console.warn(`ttype error: ${ttype}`, fieldNode);
    }
    const viewIndex = fieldNode.name || field.name;
    const invisible = (fieldNode.invisible as boolean) || field.invisible;
    const required = (fieldNode.required as boolean) || field.required;
    const readonly = (fieldNode.readonly as boolean) || field.readonly;
    const compute = (fieldNode.compute as string) || field.compute;
    const sortable = fieldNode.sortable !== false;
    const hint = fieldNode.hint as string;
    return {
      ...field,
      name,
      widget,
      ttype,
      viewIndex,
      invisible,
      required,
      readonly,
      compute,
      sortable,
      hint,
      displayName: (fieldNode.title as string) || field.label || field.displayName || field.name
    } as IModelField;
  }

  public static filterFieldsByDslNode(dslNode: IDslNode | null = null, model: IModel): IModelField[] {
    const viewFields: IModelField[] = XMLTemplateParser.getViewFieldsByDslNode(dslNode, model);
    const fields: IModelField[] = [];
    viewFields.forEach((viewField) => {
      if (!fields.find((field) => viewField.name === field.name)) {
        fields.push(viewField);
      }
    });
    return fields;
  }

  /**
   * @deprecated v3.0.0版本的解析视图的xml
   */
  public static getViewFieldsByDslNodeLegacy(dslNode: IDslNode | null = null, model: IModel): IModelField[] {
    if (!dslNode) {
      return model.modelFields;
    }
    if (dslNode.tagName === 'FIELD') {
      const field = model.modelFields.find((modelField) => modelField.name === dslNode.data);
      if (!field) {
        console.warn(`field not fund ${dslNode.data}`, dslNode);
        return [];
      }
      return [this.createDslField(dslNode, field)];
    }
    const dslFields: IModelField[] = [];
    dslNode.children.forEach((node) => {
      if (node.tagName === 'FIELD') {
        const field: (IModelField & { node?: IDslNode }) | undefined = model.modelFields.find(
          (modelField) => modelField.name === node.data
        );
        if (field) {
          field.node = node;
          if (!dslFields.find((f) => f.name === node.name)) {
            dslFields.push(this.createDslField(node, field));
          }
        }
      } else if (node.tagName === 'GROUP' || node.tagName === 'GRID') {
        const groupChildren = node.children;
        groupChildren.forEach((groupChildNode) => {
          const children = this.getViewFieldsByDslNode(groupChildNode, model);
          children.forEach((modelField) => modelField && dslFields.push(modelField));
        });
      }
    });
    return dslFields;
  }

  public static getViewFieldsByDslNode(dslNode: IDslNode | null = null, model?: IModel): IModelField[] {
    if (!dslNode) {
      return [];
    }
    if (dslNode.dslNodeType === 'field') {
      // const field = model.modelFields.find((modelField) => modelField.name === dslNode.name);
      // if (!field) {
      //   console.warn(`field not fund ${dslNode.data}`, dslNode);
      //   return [];
      // }
      return [this.createDslField(dslNode, dslNode as any)];
    }
    const dslFields: IModelField[] = [];
    dslNode.forEach &&
      dslNode.forEach((node) => {
        if (node.dslNodeType === 'field') {
          if (!dslFields.find((f) => f.name === node.name)) {
            dslFields.push(this.createDslField(node, node as any));
          }
        } else if (node.tagName === 'GROUP' || node.tagName === 'GRID') {
          const groupChildren = node.children;
          groupChildren.forEach((groupChildNode) => {
            const children = this.getViewFieldsByDslNode(groupChildNode, model);
            children.forEach((modelField) => modelField && dslFields.push(modelField));
          });
        }
      });
    return dslFields;
  }

  /**
   * 获取dsl中tag为context的属性
   *
   * @param  {IDslNode} dslNode
   * @returns {Object}
   */
  public static parserContext(dslNode: IDslNode | undefined): Record<string, unknown> {
    return XMLTemplateParser.parserNode(dslNode, ElementType.CONTEXT, ElementType.PROP);
  }

  /**
   * 获取dsl中tag为request的属性
   *
   * @param  {IDslNode} dslNode
   * @returns {Object}
   */
  public static parserRequest(dslNode: IDslNode): Record<string, unknown> {
    return XMLTemplateParser.parserNode(dslNode, ElementType.REQUEST, ElementType.FIELD);
  }

  /**
   * 获取dsl中tag为response的属性
   *
   * @param  {IDslNode} dslNode
   * @returns {Object}
   */
  public static parserResponse(dslNode: IDslNode): Record<string, unknown> {
    return XMLTemplateParser.parserNode(dslNode, ElementType.RESPONSE, ElementType.FIELD);
  }

  /**
   * 获取dsl中tag为clear的属性
   *
   * @param  {IDslNode} dslNode
   * @returns {Object}
   */
  public static parserClear(dslNode: IDslNode): Record<string, unknown> {
    return XMLTemplateParser.parserNode(dslNode, ElementType.CLEAR, ElementType.FIELD);
  }

  /**
   * 解析指定子节点的配置对象
   * @param dslNode 节点对象
   * @param tagName 标签名
   * @param childTagName 子标签名
   * @param isGetPropFromAttribute 是否从标签的属性上获取配置
   */
  public static parserNode(
    dslNode: IDslNode | undefined,
    tagName: string,
    childTagName: string,
    isGetPropFromAttribute?
  ): Record<string, unknown> {
    if (!dslNode || !tagName) {
      return {};
    }

    if (typeof dslNode === 'object' && !Object.keys(dslNode).length) {
      return {};
    }
    const nodeList = dslNode.children.filter((c) => c.tagName === tagName.toUpperCase());
    if (nodeList && nodeList.length) {
      const result = {};

      if (isGetPropFromAttribute) {
        // v2版本取标签上的属性
        nodeList.forEach((childNode) => {
          Object.assign(result, childNode);
        });
      }

      // v3版本取子节点标签的属性，覆盖v2版本的同名属性
      nodeList[0].children.forEach((childTag) => {
        if (childTag.tagName === childTagName) {
          result[XMLTemplateParser.kebabCase2PascalCase(childTag.name)] = childTag.textContent;
        }
      });

      return result;
    }

    return {} as IDslNode;
  }

  /**
   * 间隔号风格转换为驼峰
   * 单词大写开头 (PascalCase)
   * 横线连接 (kebab-case)
   * @param str
   */
  public static kebabCase2PascalCase(str): string {
    return str.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
  }

  /**
   * 驼峰风格转换为间隔号
   * @param str
   */
  public static pascalCase2kebabCase(str): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  public static parserAction(dslNode: IDslNode | undefined): (IAction | IClientAction)[] {
    // const removeChildren = (node: IDslNode) => {
    //   if (node.children) {
    //     node.children.forEach((cn) => {
    //       if (cn.tagName === 'ACTION') {
    //         const index = actions.findIndex((a) => a.name === cn.refs && a.actionType !== ActionType.Composition);
    //         if (index === -1) {
    //           actions.push({ rule: 'false', name: cn.refs as string } as IAction);
    //         }
    //         removeChildren(cn);
    //       }
    //     });
    //   }
    // };
    const actions: IAction[] = [];
    const anodes = (dslNode && dslNode.children && dslNode.children.filter((a) => a.tagName === 'ACTION')) || [];
    anodes.forEach((anode, index) => {
      const action = {} as IClientAction | ICompositionAction;
      action.rule = (anode.rule as string) || '';
      action.invisible = (anode.invisible as string) || '';
      action.displayName = anode.displayName as string;
      action.model = anode.model as string;
      action.label = anode.label as string;
      action.name = (anode.refs as string) || (anode.name as string) || '';
      action.priority = anode.priority as number;
      action.tag = anode.tag as string;
      if (anode && anode.actionType && anode.actionType.toUpperCase() === ActionType.Composition) {
        (action as unknown as ICompositionAction).actionType = ActionType.Composition;
        action.name = `composition${anode.children
          .map((a) => (a.refs as string) || (a.name as string) || '')
          .join('#')}`;
      }
      actions.push({ ...anode, ...action });
    });
    // anodes.forEach((an) => removeChildren(an));
    return actions;
  }

  public static parserToGQL(dslNode: IDslNode): string {
    if (dslNode.tagName === 'VIEW') {
      return `{\n${dslNode.children
        .filter((n) => n.tagName === 'FIELD' || n.tagName === 'GROUP')
        .map((n) => XMLTemplateParser.parserToGQL(n))
        .join('\n')}\n}`;
    }
    if (dslNode.tagName === 'FIELD') {
      if (dslNode.children.length === 0) {
        return dslNode.name!;
      }
      const placeholders = dslNode.children
        .filter((dsl) => dsl.tagName === 'PLACEHOLDER')
        .filter(
          (p) =>
            p.children.length &&
            ((p.children[0].widget && !p.children[0].widget.startsWith('DIALOG')) || !p.children[0].widget)
        );
      if (!placeholders.length) {
        return dslNode.name!;
      }
      const view = placeholders[0].children[0];
      return `${dslNode.name!}${XMLTemplateParser.parserToGQL(view)}`;
    }
    if (dslNode.tagName === 'GROUP') {
      return dslNode.children.map((n) => XMLTemplateParser.parserToGQL(n)).join('\n');
    }
    console.warn(`unsupported node: ${dslNode.tagName}`, dslNode);
    return '{}';
  }

  public static resolveVariables(node: IDslNode) {
    const { variables } = node;
    if (!variables) {
      return {};
    }
    const variablenameArr = ((variables as string) || '').split(';');
    const variablesObject: Record<string, string> = {};
    variablenameArr.forEach((vari) => {
      const varipath = vari.split(':');
      const name = varipath[0];
      const value = varipath[1];
      variablesObject[name] = value;
    });
    return variablesObject;
  }
}

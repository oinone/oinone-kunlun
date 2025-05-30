import {
  ActionElement,
  ApiElement,
  ClearElement,
  ContextElement,
  FieldElement,
  PropElement,
  RequestElement,
  ResponseElement,
  ViewElement
} from '../element';

import { IModelField, ElementType, IDslNode } from '../metadata';
import { deepClone } from './helper';

const createViewElement = (dslNode: IDslNode | undefined): ViewElement | null => {
  if (!dslNode) {
    return {} as ViewElement;
  }
  return !Array.isArray(dslNode) ? (deepClone(dslNode) as ViewElement) : null;
};

const createPropElements = (parentNode: IDslNode | undefined): PropElement[] => {
  if (!parentNode || !parentNode.children) {
    return [] as FieldElement[];
  }
  return parentNode.children
    .filter((a) => a.tagName === ElementType.PROP)
    .map((node) => {
      return {
        name: node.name,
        textContent: node.textContent
      } as FieldElement;
    });
};

const createFieldElement = (fieldNode: IDslNode | undefined): FieldElement => {
  if (!fieldNode) {
    return {} as FieldElement;
  }
  return deepClone(fieldNode) as FieldElement;
};

const createFieldElements = (parentNode: IDslNode | undefined): FieldElement[] => {
  if (!parentNode || !parentNode.children) {
    return [] as FieldElement[];
  }
  return parentNode.children
    .filter((a) => a.tagName === ElementType.FIELD)
    .map((node) => {
      return {
        name: node.name,
        textContent: node.textContent,
        children: createFieldElements(node)
      } as FieldElement;
    });
};

/**
 * 创建action元素
 * @param actionNode
 * @param parentDslNode actionNode所在的父节点
 */
const createActionElement = (actionNode: IDslNode, parentDslNode: IDslNode): ActionElement => {
  if (!parentDslNode) {
    return {} as ActionElement;
  }
  const actionEle = deepClone(actionNode) as ActionElement;
  const apiNode =
    (parentDslNode.children &&
      parentDslNode.children.find((d) => d.tagName === ElementType.API && d.name === actionEle.submitApi)) ||
    null;
  if (apiNode) {
    const apiEle = createApiElement(parentDslNode, actionEle.submitApi);
    if (!apiEle) {
      return {} as ActionElement;
    }
    actionEle.api = apiEle;
  }
  return actionEle;
};

const createApiElement = (parentDslNode: IDslNode, apiName: string, dslFields?: IModelField[]) => {
  const apiNode =
    (parentDslNode.children &&
      parentDslNode.children.find((d) => d.tagName === ElementType.API && d.name === apiName)) ||
    null;
  if (!apiNode) {
    console.warn(`api not fund: ${apiName}`, parentDslNode);
    return null;
  }
  const apiElement = deepClone(apiNode) as ApiElement;
  if (!apiElement.fun) {
    console.warn(`api fun not fund: ${apiName}`, parentDslNode);
  }
  if (!apiElement.type) {
    console.warn(`api type not fund: ${apiName}`, parentDslNode);
  }
  apiElement.context = {
    props: createPropElements(apiNode!.children.find((d) => d.tagName === ElementType.CONTEXT))
  } as ContextElement;
  apiElement.request = {
    fields: mergeFields(
      createFieldElements(apiNode!.children.find((d) => d.tagName === ElementType.REQUEST)),
      dslFields
    )
  } as RequestElement;
  apiElement.response = {
    fields: mergeFields(
      createFieldElements(apiNode!.children.find((d) => d.tagName === ElementType.RESPONSE)),
      dslFields
    )
  } as ResponseElement;
  apiElement.clear = {
    fields: createFieldElements(apiNode!.children.find((d) => d.tagName === ElementType.CLEAR))
  } as ClearElement;
  return apiElement;
};

function mergeFields(fieldElements: FieldElement[], dslFields?: IModelField[]) {
  return fieldElements && fieldElements.length
    ? fieldElements
    : (dslFields || []).map((a) => modelField2fieldElement(a));
}

const fieldElement2ModelField = (fieldElement: FieldElement): IModelField => {
  return {
    name: fieldElement.data,
    ttype: fieldElement.ttype,
    references: fieldElement.references!,
    relatedTtype: fieldElement.relatedTtype
  } as IModelField;
};

const modelField2fieldElement = (modelField: IModelField): FieldElement => {
  return {
    data: modelField.name,
    name: modelField.name,
    ttype: modelField.ttype,
    references: modelField.references,
    relatedTtype: modelField.relatedTtype
  } as FieldElement;
};

export {
  createViewElement,
  createApiElement,
  createPropElements,
  createFieldElements,
  createActionElement,
  createFieldElement,
  fieldElement2ModelField,
  modelField2fieldElement
};

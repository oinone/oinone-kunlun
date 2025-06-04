import { ModelFieldType } from '@oinone/kunlun-meta';

export interface QueryVariables extends Record<string, unknown> {
  scene?: string;
  metadata?: Record<string, VirtualModel>;
}

export interface QueryParameter extends Record<string, string | undefined> {
  scene?: string;
}

export interface QueryContext extends Record<string, unknown> {
  __queryParams?: QueryParameter;
}

export interface VirtualModel {
  model: string;
  fields: Record<string, string | VirtualField | VirtualRelationField>;
}

export interface VirtualField {
  ttype: ModelFieldType;
}

export interface VirtualRelationField extends VirtualField {
  references: string;
  relationFields: string[];
  referenceFields: string[];
}

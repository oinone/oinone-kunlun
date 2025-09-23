export interface BaseModel {
  draftCode?: string;
}

export interface IdModel extends BaseModel {
  id?: string;
}

export interface CodeModel extends IdModel {
  code?: string;
}

export interface NameCodeModel extends CodeModel {
  name?: string;
}

export interface TreeModel extends CodeModel {
  parentCode?: string;
  treeCode?: string;
}

export interface BizModel {
  createUserName?: string;
  writeUserName?: string;
}

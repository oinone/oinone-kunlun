export interface IdModel {
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

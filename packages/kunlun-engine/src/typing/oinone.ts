export interface IOinone {
  view: string; // 主视图template
  dslNode: Record<string, unknown>; // 主视图经spi compiler后生成的dslNode树
  mask: string; // mask template
  maskDslNode: string; // mask template
  OCache: OinoneCache; // 平台级cache的能力
  OModel: OinoneModel;
  OModule: OinoneModule;
}

interface OinoneCache {
  cache: any; //cache 实例
  insert: () => void;
  delete: () => void;
  query: () => void;
  queryAll: () => void;
  update: () => void;
}

interface OinoneModel {
  model: any; // model实例
  getModelFields: () => void;
  getModelType: () => void;
  getModelByName: () => void;
}

interface OinoneModule {
  module: any; //module实例
  getMenus: () => void;
}

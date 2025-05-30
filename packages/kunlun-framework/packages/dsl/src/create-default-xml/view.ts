import { ViewType } from '@kunlun/meta';

const localViewTplMap = new Map<string, string>();
const setLocalViewTpl = (modelModel: string, viewType: ViewType, viewName: string, tpl: string) => {
  localViewTplMap.set([modelModel, viewType, viewName].join('-'), tpl);
};
const getLocalViewTpl = (modelModel: string, viewType: ViewType, viewName: string): string => {
  return localViewTplMap.get([modelModel, viewType, viewName].join('-')) as string;
};

export { setLocalViewTpl, getLocalViewTpl };

import { useMatched } from '@oinone/kunlun-router';

export const getUrlParams = () => {
  return useMatched().matched.segmentParams.page;
};

export const getUrlParamByKey = (key: string) => {
  return useMatched().matched.segmentParams.page[key] || '';
};

export const getModelByUrl = () => {
  return getUrlParamByKey('model');
};

export const getIdByUrl = () => {
  return getUrlParamByKey('id');
};

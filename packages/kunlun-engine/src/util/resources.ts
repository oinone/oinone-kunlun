import { RuntimeConfig } from '@kunlun/meta';

const getStaticImgPath = () => {
  const runtimeConfig = RuntimeConfig.get();
  return runtimeConfig.STATIC_IMG || process.env.STATIC_IMG || '';
};

export const genStaticPath = (resourceName: string) => {
  return `${getStaticImgPath()}/${resourceName}`;
};

export const genDesignerStaticPath = (resourceName: string) => {
  return `${getStaticImgPath()}/images/designer/${resourceName}`;
};

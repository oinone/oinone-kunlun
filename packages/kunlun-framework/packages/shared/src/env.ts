export const __DEV__ = process.env.NODE_ENV === 'development';
export const isDevMode = () => {
  return (window as any).mode === 'dev';
};

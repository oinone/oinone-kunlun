const multiViewTabKeyMap = new Map<string, string>();

export const useMultiViewKeyCache = (uniqueKey: string) => {
  if (!multiViewTabKeyMap.has(uniqueKey)) {
    multiViewTabKeyMap.set(uniqueKey, '');
  }

  const getActiveKey = () => {
    return multiViewTabKeyMap.get(uniqueKey);
  };

  const setActiveKey = (key: string) => {
    multiViewTabKeyMap.set(uniqueKey, key);
  };

  const deleteActiveKey = () => {
    multiViewTabKeyMap.delete(uniqueKey);
  };

  return {
    setActiveKey,
    getActiveKey,
    deleteActiveKey
  };
};

export type MultiViewKeyCache = typeof useMultiViewKeyCache;

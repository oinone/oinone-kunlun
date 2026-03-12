let retId = 0;

export function useSelectId() {
  const uuid = retId;
  retId += 1;
  return `oio_select_${uuid}`;
}

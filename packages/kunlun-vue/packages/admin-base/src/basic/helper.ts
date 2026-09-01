export function getClickActionInfo(
  currentModel: string,
  clickActionName: string | undefined
):
  | {
      model: string;
      name: string;
    }
  | undefined {
  if (!clickActionName) {
    return undefined;
  }
  const ss = clickActionName.split('#');
  if (ss.length === 1) {
    return { model: currentModel, name: clickActionName };
  }
  if (ss.length === 2) {
    return { model: ss[0], name: ss[1] };
  }
  return undefined;
}

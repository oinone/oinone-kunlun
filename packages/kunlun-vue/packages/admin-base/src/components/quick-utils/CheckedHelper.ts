import { OioListItem, OioTreeNode } from '@oinone/kunlun-shared';

export class CheckedHelper {
  public static diffListCheckedKeys(
    originStorage: Record<string, OioListItem>,
    targetStorage: Record<string, OioListItem>,
    checkedKeys: string[],
    changedCheckedKeys: string[]
  ): string[] {
    changedCheckedKeys = [...changedCheckedKeys];
    const finalCheckedKeys: string[] = [];
    for (const checkedKey of checkedKeys) {
      if (targetStorage[checkedKey]) {
        const index = changedCheckedKeys.indexOf(checkedKey);
        if (index !== -1) {
          changedCheckedKeys.splice(index, 1);
          finalCheckedKeys.push(checkedKey);
        }
      } else if (originStorage[checkedKey]) {
        finalCheckedKeys.push(checkedKey);
      }
    }
    finalCheckedKeys.push(...changedCheckedKeys);
    return finalCheckedKeys;
  }

  public static diffTreeCheckedKeys(
    originStorage: Record<string, OioTreeNode>,
    targetStorage: Record<string, OioTreeNode>,
    checkedKeys: string[],
    changedCheckedKeys: string[]
  ): string[] {
    changedCheckedKeys = [...changedCheckedKeys];
    const finalCheckedKeys: string[] = [];
    const deleteKeys: string[] = [];
    const repeatKeys = new Set<string>();
    const push = (checkedKey: string) => {
      const node = originStorage[checkedKey];
      if (!node) {
        return;
      }
      if (!repeatKeys.has(checkedKey)) {
        repeatKeys.add(checkedKey);
        finalCheckedKeys.push(checkedKey);
      }
      node.children.map((v) => v.key).forEach((v) => push(v));
    };
    for (const checkedKey of checkedKeys) {
      if (targetStorage[checkedKey]) {
        const index = changedCheckedKeys.indexOf(checkedKey);
        if (index === -1) {
          deleteKeys.push(checkedKey);
        } else {
          changedCheckedKeys.splice(index, 1);
          push(checkedKey);
        }
      } else if (!repeatKeys.has(checkedKey)) {
        repeatKeys.add(checkedKey);
        finalCheckedKeys.push(checkedKey);
      }
    }
    changedCheckedKeys.forEach((v) => push(v));
    const deleteKey = (checkedKey: string) => {
      const node = originStorage[checkedKey];
      if (!node) {
        return;
      }
      const index = finalCheckedKeys.indexOf(checkedKey);
      if (index !== -1) {
        finalCheckedKeys.splice(index, 1);
      }
      node.children.map((v) => v.key).forEach((v) => deleteKey(v));
    };
    deleteKeys.forEach((v) => deleteKey(v));
    return finalCheckedKeys;
  }
}

import { OioListItem, OioTreeNode, TreeHelper, TreeNode, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { AbstractModelApi } from '../../service';
import { PamirsDepartment, PamirsEmployee } from '../../typing';
import {
  PamirsDepartmentMetadata,
  PamirsDepartmentService,
  PamirsDepartmentServiceToken
} from '../PamirsDepartmentService';

@SPI.Service(PamirsDepartmentServiceToken)
export class PamirsDepartmentServiceImpl extends AbstractModelApi<PamirsDepartment> implements PamirsDepartmentService {
  protected get modelModel() {
    return PamirsDepartmentMetadata.MODEL_MODEL;
  }

  public convertListData(
    list: PamirsEmployee[],
    options?: {
      computeTitle?: () => string;
    }
  ): OioListItem<PamirsEmployee>[] {
    const computeTitle =
      options?.computeTitle ||
      ((data: PamirsEmployee) => {
        return data.name || data.code || data.id || uniqueKeyGenerator();
      });
    return list.map((v) => {
      const key = v.code!;
      const option: OioListItem<PamirsEmployee> = {
        key,
        value: key,
        label: computeTitle(v),
        data: v
      };
      return option;
    });
  }

  public convertTreeData(
    list: PamirsDepartment[],
    options?: {
      computeTitle?: () => string;
    }
  ): OioTreeNode<PamirsDepartment>[] {
    const computeTitle =
      options?.computeTitle ||
      ((data: PamirsDepartment) => {
        return data.name || data.code || data.id || uniqueKeyGenerator();
      });
    return TreeHelper.convert<PamirsDepartment, PamirsDepartment, OioTreeNode<PamirsDepartment>>(
      list,
      (v) => v.code,
      (v) => v.parentCode,
      (v) => v,
      (key, value, parent) => {
        const node = TreeNode.newInstance(
          key,
          value,
          parent as TreeNode<PamirsDepartment>
        ) as OioTreeNode<PamirsDepartment>;
        if (value) {
          node.title = computeTitle(value);
        }
        return node;
      },
      (node) => {
        const { title, value } = node;
        if (!title) {
          node.title = computeTitle(value);
        }
        return node;
      }
    );
  }
}

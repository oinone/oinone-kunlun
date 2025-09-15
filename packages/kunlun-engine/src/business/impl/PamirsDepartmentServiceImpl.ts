import { OioTreeNode, TreeHelper, TreeNode, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { AbstractModelApi } from '../../service';
import { PamirsDepartment } from '../../typing';
import { PamirsDepartmentMetadata, PamirsDepartmentService, PamirsDepartmentToken } from '../PamirsDepartmentService';

@SPI.Service(PamirsDepartmentToken)
export class PamirsDepartmentServiceImpl extends AbstractModelApi<PamirsDepartment> implements PamirsDepartmentService {
  protected get modelModel() {
    return PamirsDepartmentMetadata.MODEL_MODEL;
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

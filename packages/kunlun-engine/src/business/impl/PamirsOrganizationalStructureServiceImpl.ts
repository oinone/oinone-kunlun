import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { AbstractTreeModelApi, QueryWrapper } from '../../service';
import { OrganizationalStructureType, PamirsDepartment, PamirsOrganizationalStructure } from '../../typing';
import { PamirsCompanyService, PamirsCompanyServiceToken } from '../PamirsCompanyService';
import {
  PamirsDepartmentMetadata,
  PamirsDepartmentService,
  PamirsDepartmentServiceToken
} from '../PamirsDepartmentService';
import {
  OrganizationalStructureQueryFilter,
  PamirsOrganizationalStructureService,
  PamirsOrganizationalStructureServiceToken
} from '../PamirsOrganizationalStructureService';

@SPI.Service(PamirsOrganizationalStructureServiceToken)
export class PamirsOrganizationalStructureServiceImpl
  extends AbstractTreeModelApi<PamirsOrganizationalStructure>
  implements PamirsOrganizationalStructureService
{
  @SPI.Autowired(PamirsCompanyServiceToken)
  private companyService!: PamirsCompanyService;

  @SPI.Autowired(PamirsDepartmentServiceToken)
  private departmentService!: PamirsDepartmentService;

  protected get modelModel() {
    return PamirsDepartmentMetadata.MODEL_MODEL;
  }

  protected get companyModel(): string | undefined {
    return undefined;
  }

  public async queryListByWrapper(queryWrapper: QueryWrapper): Promise<PamirsOrganizationalStructure[]> {
    const departments = await this.departmentService.queryListByWrapper(queryWrapper);
    if (!departments.length) {
      return [];
    }
    return this.convertOrganizationalStructures(departments);
  }

  public async queryListByFilter(query: OrganizationalStructureQueryFilter): Promise<PamirsOrganizationalStructure[]> {
    const departments = await this.departmentService.queryListByFilter(query);
    if (!departments.length) {
      return [];
    }
    return this.convertOrganizationalStructures(departments, query);
  }

  protected async convertOrganizationalStructures(
    departments: PamirsDepartment[],
    query?: OrganizationalStructureQueryFilter
  ): Promise<PamirsOrganizationalStructure[]> {
    const results: PamirsOrganizationalStructure[] = [];
    const companyCodes = new Set<string>();
    for (const department of departments) {
      const { companyCode } = department;
      if (!companyCode) {
        continue;
      }
      companyCodes.add(companyCode);
      const target: PamirsOrganizationalStructure = {
        type: OrganizationalStructureType.department,
        id: department.id,
        code: department.code,
        name: department.name,
        parentCode: department.parentCode,
        parentType: OrganizationalStructureType.department,
        value: department
      };
      if (!target.parentCode) {
        target.parentCode = companyCode;
        target.parentType = OrganizationalStructureType.company;
      }
      results.push(target);
    }
    if (!companyCodes.size) {
      return [];
    }
    const companyList = await this.companyService.queryListByWrapper({
      model: query?.companyModel || this.companyModel,
      rsql: `code =in= (${Array.from(companyCodes.values())
        .map((v) => `${v}`)
        .join(',')})`
    });
    if (!companyList.length) {
      return [];
    }
    for (const company of companyList) {
      results.push({
        type: OrganizationalStructureType.company,
        id: company.id,
        code: company.code,
        name: company.name,
        value: company
      });
    }
    return results;
  }

  public convertTreeData(
    list: PamirsOrganizationalStructure[],
    options?: {
      convertNode?: (node: OioTreeNode<PamirsOrganizationalStructure>) => void;
    }
  ): OioTreeNode<PamirsOrganizationalStructure>[] {
    return super.convertTreeData(list, {
      ...options,
      convertNode:
        options?.convertNode ||
        ((node: OioTreeNode<PamirsOrganizationalStructure>) => {
          node.selectable = node.value.type === OrganizationalStructureType.department;
        })
    });
  }

  protected defaultComputeKey(data: PamirsOrganizationalStructure): string {
    return `${data.type}-${super.defaultComputeKey(data)}`;
  }

  protected defaultComputeParentKey(data: PamirsOrganizationalStructure): string | undefined {
    const parentKey = super.defaultComputeParentKey(data);
    if (parentKey) {
      return `${data.parentType}-${parentKey}`;
    }
    return undefined;
  }
}

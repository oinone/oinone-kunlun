import { HttpClient } from '@oinone/kunlun-request';
import { buildSingleItemParam, getModel } from '@oinone/kunlun-service';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { EXP_MODULE, ExpModelConfig, IExpressionDefinition, IQueryExpressionParam } from '../types';

const http = HttpClient.getInstance();

export const DESIGNER_MODULES = [
  'dataDesigner',
  'uiDesigner',
  'modelDesigner',
  'logicDesigner',
  'workflowDesigner',
  'eipDesigner',
  'dataflowDesigner',
  'microflowDesigner'
];

function isDesignerModule() {
  const headerModule = new URL(window.location.href.replace(';', '?').replaceAll(';', '&')).searchParams.get(
    'module'
  ) as string;
  return DESIGNER_MODULES.includes(headerModule);
}

function getExpModel(isDesigner: boolean) {
  return isDesigner ? 'designerExpressionDefinition' : 'expressionDefine';
}

function getExpMoudleName(isDesigner: boolean) {
  return isDesigner ? SYSTEM_MODULE_NAME.DESIGNER_COMMON : EXP_MODULE.name;
}

export async function queryExpression(param: IQueryExpressionParam): Promise<IExpressionDefinition> {
  const { model, field, key } = param || ({} as IQueryExpressionParam);
  if (!model || !field || !key) {
    return null as unknown as IExpressionDefinition;
  }

  const isDesigner = isDesignerModule();
  const queryName = getExpModel(isDesigner);
  const body = `
  query{
    ${queryName}Query{
      queryOne(query: {model:"${model}",field:"${field}",key:"${key}"}) {
        id
        code
        model
        field
        key
        expressionType
        rowList{
          rowType
          connector {
            cellType
            original
            translation
          }
          blockList{
            blockType
            original
            translation
            cellList{
              translation
              original
              cellType
              value
              ttype
              multi
              bitEnum
              store
            }
            ##函数特殊类型
            fun{
              translation
              original
              cellType
            }
            funArgList{
              cellList{
               translation
               original
               cellType
               value
               ttype
               multi
               bitEnum
               store
              }
              blockType
            }
          }
        }
      }
    }
  }
  `;
  const result = await http.query(getExpMoudleName(isDesigner), body);
  // console.log('queryExpression', modelModel, field, key, result.data.designerExpressionDefinitionQuery.queryOne);
  return result.data[`${queryName}Query`].queryOne as unknown as IExpressionDefinition;
}

export async function createExpressionDefinition(record: IExpressionDefinition | null) {
  if (!record) {
    return null;
  }

  const isDesigner = isDesignerModule();
  const queryName = getExpModel(isDesigner);
  const model = await getModel(ExpModelConfig.DesignerExpressionDefinition);
  const paramStr = await buildSingleItemParam(model!.modelFields, record);
  const body = `
    mutation{
      ${queryName}Mutation{
        save(data:${paramStr}) {
          id
        }
      }
    }
  `;
  const result = (await http.mutate(getExpMoudleName(isDesigner), body)) as any;
  // console.log('createExpressionDefinition', record, result.data.designerExpressionDefinitionMutation.save);
  return result.data[`${queryName}Mutation`].save;
}

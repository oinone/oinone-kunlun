import { GQLBuilder, GQLRequestParameterBuilder } from '@oinone/kunlun-request';
import { isRelation2MField, RequestModelField } from '../runtime-context';
import { RuntimeModel, RuntimeRelationField } from '../runtime-metadata';
import { SubmitRelationValue, SubmitValue } from '../submit';
import { ActiveRecord } from '../typing';
import { FunctionExecuteOptions, FunctionOptions, FunctionService } from './FunctionService';
import { FunctionMetadata, RelationData, RelationDataModel } from './metadata';

export class UpdateOneWithRelationsService {
  private static DATA_PARAMETER_NAME = 'data';

  private static RELATIONS_PARAMETER_NAME = 'relations';

  private static CREATE_PARAMETER_NAME = 'create';

  private static UPDATE_PARAMETER_NAME = 'update';

  private static DELETE_PARAMETER_NAME = 'delete';

  public static async execute<T = ActiveRecord>(
    model: RuntimeModel,
    submitValue: SubmitValue,
    options: FunctionOptions
  ): Promise<T> {
    const { model: modelModel, name: modelName, moduleName } = model;

    const { requestFields, responseFields, variables, context } = options;

    const requestFieldsMap: Record<string, RequestModelField[]> = { [modelModel]: requestFields };
    UpdateOneWithRelationsService.fillRequestFieldsMap(requestFieldsMap, requestFields);

    const executeOptions: FunctionExecuteOptions = {
      model: modelModel,
      modelName,
      requestFields: requestFieldsMap,
      responseFields: { [modelModel]: responseFields || requestFields }
    };
    const graphQL = FunctionService.INSTANCE.buildGQLByFunction(
      FunctionMetadata.updateOneWithRelationsFunction,
      executeOptions
    );
    const data: RelationDataModel = { data: submitValue.records as ActiveRecord };
    data.relations = UpdateOneWithRelationsService.generatorRelations(submitValue.relationRecords);
    UpdateOneWithRelationsService.buildRequestParameters(executeOptions, graphQL, data);
    return graphQL.request(moduleName, variables, context);
  }

  private static fillRequestFieldsMap(
    requestFieldsMap: Record<string, RequestModelField[]>,
    requestFields: RequestModelField[],
    basePath?: string
  ) {
    requestFields.forEach((requestField) => {
      const { field: relationField, referencesFields } = requestField;
      if (isRelation2MField(relationField) && referencesFields?.length) {
        let nextBasePath: string;
        if (!basePath) {
          nextBasePath = relationField.data;
        } else {
          nextBasePath = [basePath, relationField.data].join('#');
        }
        const path = [nextBasePath, relationField.references].join('#');
        requestFieldsMap[path] = referencesFields;
        UpdateOneWithRelationsService.fillRequestFieldsMap(requestFieldsMap, referencesFields, nextBasePath);
      }
    });
  }

  private static generatorRelations(relationRecords: SubmitRelationValue[]): Record<string, RelationData> | undefined {
    const relations: Record<string, RelationData> = {};
    relationRecords.forEach((relationRecord) => {
      relations[relationRecord.getField().data] = {
        field: relationRecord.getField(),
        create: relationRecord.getCreateRecords().map((data) => ({ data })),
        update: relationRecord.getUpdateRecords().map((data) => ({ data })),
        delete: relationRecord.getDeleteRecords().map((data) => ({ data }))
      };
    });
    return relations;
  }

  private static buildRequestParameters(
    options: FunctionExecuteOptions,
    graphQL: GQLBuilder,
    data: RelationDataModel
  ): void {
    graphQL.buildRequest((requestBuilder) => {
      requestBuilder.buildObjectParameter(UpdateOneWithRelationsService.DATA_PARAMETER_NAME, (builder) => {
        const { data: requestData, relations } = data;
        const requestFields = options.requestFields[options.model];
        UpdateOneWithRelationsService.buildDataRequestParameters(options, builder, requestFields, requestData);
        if (relations) {
          UpdateOneWithRelationsService.buildRelationsRequestParameters(options, builder, relations);
        }
      });
    });
  }

  private static buildDataRequestParameters(
    options: FunctionExecuteOptions,
    builder: GQLRequestParameterBuilder,
    requestFields: RequestModelField[],
    value: object
  ) {
    builder.buildObjectParameter(UpdateOneWithRelationsService.DATA_PARAMETER_NAME, (dataBuilder) => {
      FunctionService.INSTANCE.buildRequestParameters(options, dataBuilder, requestFields, value);
    });
  }

  private static buildRelationsRequestParameters(
    options: FunctionExecuteOptions,
    builder: GQLRequestParameterBuilder,
    relations: Record<string, RelationData>
  ) {
    builder.buildObjectParameter(UpdateOneWithRelationsService.RELATIONS_PARAMETER_NAME, (relationsBuilder) => {
      Object.entries(relations).forEach(([field, value]) => {
        const { field: relationField } = value;
        relationsBuilder.buildObjectParameter(field, (valueBuilder) => {
          UpdateOneWithRelationsService.buildRelationValueRequestParameters(
            options,
            valueBuilder,
            UpdateOneWithRelationsService.CREATE_PARAMETER_NAME,
            relationField,
            value.create
          );
          UpdateOneWithRelationsService.buildRelationValueRequestParameters(
            options,
            valueBuilder,
            UpdateOneWithRelationsService.UPDATE_PARAMETER_NAME,
            relationField,
            value.update
          );
          UpdateOneWithRelationsService.buildRelationValueRequestParameters(
            options,
            valueBuilder,
            UpdateOneWithRelationsService.DELETE_PARAMETER_NAME,
            relationField,
            value.delete
          );
        });
      });
    });
  }

  private static buildRelationValueRequestParameters(
    options: FunctionExecuteOptions,
    valueBuilder: GQLRequestParameterBuilder,
    key: string,
    relationField: RuntimeRelationField,
    relationRecords: RelationDataModel[]
  ) {
    const path = [relationField.data, relationField.references].join('#');
    let requestFields: RequestModelField[] | undefined = options.requestFields[path];
    if (!requestFields) {
      requestFields = relationField.referencesModel?.modelFields?.map((field) => ({ field }));
    }
    if (!requestFields?.length) {
      return;
    }
    valueBuilder.buildArrayParameter(key, relationRecords, (builder, relationRecord) => {
      const { data, relations } = relationRecord;
      UpdateOneWithRelationsService.buildDataRequestParameters(options, builder, requestFields!, data);
      if (relations) {
        UpdateOneWithRelationsService.buildRelationsRequestParameters(options, builder, relations);
      }
    });
  }
}

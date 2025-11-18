import { ModelFieldType } from '@oinone/kunlun-meta';
import { FunctionSelfFlag, FunctionType, RuntimeFunctionDefinition } from '../../../runtime-metadata';
import { StaticMetadata } from './model';

export namespace FunctionMetadata {
  export const QUERY_GROUPING_DATA_BY_WRAPPER_NAME = 'queryGroupingDataByWrapper';

  export const queryGroupingDataByWrapper: RuntimeFunctionDefinition = {
    type: [FunctionType.QUERY],
    namespace: FunctionSelfFlag,
    name: QUERY_GROUPING_DATA_BY_WRAPPER_NAME,
    fun: QUERY_GROUPING_DATA_BY_WRAPPER_NAME,
    argumentList: [
      {
        name: 'wrapper',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.TableGroupingWrapperModel,
        modelDefinition: StaticMetadata.TableGroupingWrapper
      }
    ],
    returnType: {
      ttype: FunctionSelfFlag
    }
  };

  export const QUERY_GROUPING_STATISTIC_NAME = 'queryGroupingStatistic';

  export const queryGroupingStatistic: RuntimeFunctionDefinition = {
    type: [FunctionType.QUERY],
    namespace: FunctionSelfFlag,
    name: QUERY_GROUPING_STATISTIC_NAME,
    fun: QUERY_GROUPING_STATISTIC_NAME,
    argumentList: [
      {
        name: 'wrapper',
        ttype: ModelFieldType.ManyToOne,
        model: StaticMetadata.TableGroupingWrapperModel,
        modelDefinition: StaticMetadata.TableGroupingWrapper
      }
    ],
    returnType: {
      ttype: ModelFieldType.String
    }
  };
}

import { DslDefinition } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  ActiveRecords,
  RuntimeM2MField,
  RuntimeM2OField,
  RuntimeO2MField,
  RuntimeO2OField,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { WidgetTrigger } from '@oinone/kunlun-vue-ui-common';

/**
 * 关系字段子视图组件
 */
export interface IFormSubviewFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField
> {
  dataSource: ActiveRecord[] | undefined;

  activeRecords: ActiveRecord[] | undefined;

  field: Field;

  value: Value | null | undefined;

  getValue(): Value | null | undefined;

  setValue(value: Value | null | undefined): void;

  change(value: Value | null | undefined);

  flushDataSource(reloadDataSource?: boolean);

  afterTriggerExecute(trigger: WidgetTrigger);
}

/**
 * 2O关系字段子视图组件
 */
export type IFormSubviewObjectFieldWidget<
  Field extends RuntimeO2OField | RuntimeM2OField = RuntimeO2OField | RuntimeM2OField
> = IFormSubviewFieldWidget<ActiveRecord, Field>;

/**
 * 2M关系字段子视图组件
 */
export type IFormSubviewListFieldWidget<
  Field extends RuntimeO2MField | RuntimeM2MField = RuntimeO2MField | RuntimeM2MField
> = IFormSubviewFieldWidget<ActiveRecord[], Field>;

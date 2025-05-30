import { ActiveRecord, buildQueryCondition, RuntimeContext } from '@kunlun/engine';
import { Condition } from '@kunlun/request';
import { DEFAULT_TRUE_CONDITION, EDirection } from '@kunlun/service';
import { isString } from 'lodash-es';
import { QueryExpression } from '../types';

export function generatorCondition(
  runtimeContext?: RuntimeContext,
  searchBody: ActiveRecord = {},
  searchConditions: QueryExpression[] = [],
  filter?: string,
  domain?: string,
  isFrontSearch?: boolean,
  requestData: ActiveRecord = {}
) {
  const condition = new Condition(DEFAULT_TRUE_CONDITION);
  if (runtimeContext) {
    const searchCondition = buildQueryCondition(
      runtimeContext,
      requestData,
      searchBody,
      searchConditions,
      isFrontSearch
    );
    if (searchCondition) {
      condition.setConditionBodyData(searchCondition.getConditionBodyData());
      condition.and(searchCondition);
    }
  }
  if (filter) {
    condition.and(new Condition(filter));
  }
  if (domain) {
    condition.and(new Condition(domain));
  }
  return condition;
}

function convertCondition(condition: string | Condition): Condition {
  if (isString(condition)) {
    return new Condition(condition);
  }
  return condition;
}

export function concatCondition(...conditions: (string | Condition | undefined)[]): Condition | undefined {
  let finalCondition: Condition | undefined;
  for (const condition of conditions) {
    if (condition) {
      if (finalCondition) {
        finalCondition.and(convertCondition(condition));
      } else {
        finalCondition = convertCondition(condition);
      }
    }
  }
  return finalCondition;
}

export function getSortFieldDirection(
  value: string,
  orderingFieldOrderSeparator: string = ' ',
  defaultOrderingOrder: string = EDirection.ASC
): [string, EDirection] {
  let [sortField, direction] = value.split(orderingFieldOrderSeparator);
  if (!direction) {
    direction = defaultOrderingOrder;
  }
  direction = direction.toUpperCase();
  if (!(direction as EDirection)) {
    console.error('invalid direction', direction);
  }
  if (!sortField) {
    console.error('no field in sort');
  }
  return [sortField, direction] as [string, EDirection];
}

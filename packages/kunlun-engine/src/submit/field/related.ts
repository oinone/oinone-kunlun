import { isArray } from 'lodash-es';
import { RuntimeRelatedField } from '../../runtime-metadata';
import { SubmitFn } from './typing';

export const relatedSubmit: SubmitFn<RuntimeRelatedField> = (field, itemName, submitValue, value) => {
  const currentSubmitResult = submitValue.records;
  if (!currentSubmitResult || isArray(currentSubmitResult)) {
    return undefined;
  }
  const result: Record<string, unknown> = {};
  result[itemName] = value;
  return result;
  // return generatorRelatedResult(field, currentSubmitResult, value, undefined, field.related, 0);
};

// function generatorRelatedResult(
//   originField: RuntimeRelatedField,
//   submitResult: ActiveRecord | undefined,
//   value: unknown,
//   currentField: RuntimeModelField | undefined,
//   relatedFields: string[],
//   index: number
// ): Record<string, unknown> | undefined {
//   const relatedField = relatedFields[index];
//   let nextField: RuntimeModelField | undefined;
//   if (index === 0) {
//     nextField = originField.modelDefinition?.modelFields.find((v) => v.data === relatedField);
//   } else if (currentField && isRelationField(currentField)) {
//     nextField = currentField.referencesModel?.modelFields.find((v) => v.data === relatedField);
//   }
//   const result: Record<string, unknown> = {};
//   if (index === relatedFields.length - 1) {
//     result[relatedField] = value;
//   } else if (nextField && isRelation2OField(nextField)) {
//     const nextSubmitResult = submitResult?.[relatedField] as ActiveRecord | undefined;
//     const nextResult = generatorRelatedResult(
//       originField,
//       nextSubmitResult,
//       value,
//       nextField,
//       relatedFields,
//       index + 1
//     );
//     if (nextResult) {
//       if (nextSubmitResult) {
//         ObjectUtils.shallowMerge(nextSubmitResult, nextResult);
//         result[relatedField] = nextSubmitResult;
//       } else {
//         result[relatedField] = nextResult;
//       }
//     } else {
//       return undefined;
//     }
//   } else {
//     return undefined;
//   }
//   return result;
// }

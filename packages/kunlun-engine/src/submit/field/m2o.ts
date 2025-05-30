import { getStaticRelationField, isStaticRelationField } from '../../runtime-context';
import { RuntimeM2OField } from '../../runtime-metadata';
import { ActiveRecord } from '../../typing';
import { SubmitType, SubmitVerificationType } from '../typing';
import { defaultSubmit } from './default';
import { SubmitFn } from './typing';

// export const M2OChange: ChangeFn<RuntimeM2OField, ActiveRecord> = (field, itemName, activeRecord, value) => {
//   activeRecord[itemName] = value;
//   const verificationResult = verification(field, value);
//   if (verificationResult !== SubmitVerificationType.SUCCESS) {
//     return;
//   }
//   const result = collectionResult(field!, value!);
//   if (result == null) {
//     console.error(`Don't sync change relation field value.`, value);
//     return;
//   }
//   Object.entries(result).forEach(([k, v]) => {
//     activeRecord[k] = v;
//   });
// };

export const M2OSubmit: SubmitFn<RuntimeM2OField, ActiveRecord> = (
  field,
  itemName,
  submitValue,
  value,
  defaultSubmitFn
) => {
  const verificationResult = verification(field, value);
  switch (verificationResult) {
    case SubmitVerificationType.SKIP:
      return undefined;
    case SubmitVerificationType.ERROR:
      return (defaultSubmitFn || defaultSubmit)(field, itemName, submitValue, value);
  }
  const result = collectionResult(field, value!);
  if (result == null) {
    console.error(`Don't submit value.`, field, value);
    return undefined;
  }
  return result;
};

function setNullForM2O(value: ActiveRecord | null): value is null {
  return value === null || !Object.keys(value).length;
}

function verification(field: RuntimeM2OField, value: ActiveRecord | null | undefined): SubmitVerificationType {
  if (value === undefined) {
    return SubmitVerificationType.SKIP;
  }
  const { submitType, store, relationStore, relationFields, referenceFields } = field;
  if (submitType === SubmitType.none) {
    return SubmitVerificationType.SKIP;
  }
  if (
    (store && !relationStore) ||
    !relationFields.length ||
    !referenceFields.length ||
    relationFields.length !== referenceFields.length
  ) {
    return SubmitVerificationType.ERROR;
  }
  return SubmitVerificationType.SUCCESS;
}

function collectionResult(field: RuntimeM2OField, value: ActiveRecord | null): Record<string, unknown> | undefined {
  const { relationFields, referenceFields } = field;
  const setNull = setNullForM2O(value);
  const result: Record<string, unknown> = {};
  let isSubmit = true;
  for (let i = 0; i < relationFields.length; i++) {
    const relationField = relationFields[i];
    const referenceField = referenceFields[i];
    if (isStaticRelationField(relationField)) {
      continue;
    }
    let targetValue;
    if (setNull) {
      targetValue = null;
    } else if (isStaticRelationField(referenceField)) {
      targetValue = getStaticRelationField(referenceField);
    } else {
      targetValue = value[referenceField];
    }
    if (targetValue === undefined) {
      isSubmit = false;
      break;
    }
    result[relationField] = targetValue;
  }
  if (isSubmit) {
    return result;
  }
}

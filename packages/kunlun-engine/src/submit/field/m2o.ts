import { ExperimentalConfigManager } from '../../config';
import { getStaticRelationField, isStaticRelationField } from '../../runtime-context';
import type { RuntimeM2OField } from '../../runtime-metadata';
import type { ActiveRecord } from '../../typing';
import { SubmitType, SubmitVerificationType } from '../typing';
import { defaultSubmit } from './default';
import type { SubmitFn } from './typing';

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
  const res = collectionResult(field, value!);
  if (!res) {
    console.error(`Don't submit value.`, field, value);
    return undefined;
  }
  const { result, isSetNull } = res;
  if (ExperimentalConfigManager.submitM2OStoreFieldNext()) {
    if (field.store && !isSetNull) {
      result[itemName] = value;
    }
  }
  return result;
};

function isSetNullForM2O(value: ActiveRecord | null): value is null {
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

function collectionResult(
  field: RuntimeM2OField,
  value: ActiveRecord | null
):
  | {
      result: Record<string, unknown>;
      isSetNull: boolean;
    }
  | undefined {
  const { relationFields, referenceFields } = field;
  const isSetNull = isSetNullForM2O(value);
  const result: Record<string, unknown> = {};
  let isSubmit = true;
  for (let i = 0; i < relationFields.length; i++) {
    const relationField = relationFields[i];
    const referenceField = referenceFields[i];
    if (isStaticRelationField(relationField)) {
      continue;
    }
    let targetValue: unknown;
    if (isSetNull) {
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
    return { result, isSetNull };
  }
}

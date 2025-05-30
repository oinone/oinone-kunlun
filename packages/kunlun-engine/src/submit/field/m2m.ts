import { getStaticRelationField, isStaticRelationField } from '../../runtime-context';
import { RuntimeM2MField } from '../../runtime-metadata';
import { ActiveRecord } from '../../typing';
import { SubmitType, SubmitVerificationType } from '../typing';
import { defaultSubmit } from './default';
import { SubmitFn } from './typing';

export const M2MSubmit: SubmitFn<RuntimeM2MField, ActiveRecord[]> = (
  field,
  itemName,
  submitValue,
  values,
  defaultSubmitFn
) => {
  const verificationResult = verification(field, values);
  switch (verificationResult) {
    case SubmitVerificationType.SKIP:
      return undefined;
    case SubmitVerificationType.ERROR:
      return (defaultSubmitFn || defaultSubmit)(field, itemName, submitValue, values);
    case SubmitVerificationType.SET_NULL:
      return { [itemName]: [] };
  }
  const result = collectionResult(field, values!);
  if (result == null) {
    console.error(`Don't submit values.`, field, values);
    return undefined;
  }
  return { [itemName]: result };
};

function verification(field: RuntimeM2MField, values: ActiveRecord[] | null | undefined): SubmitVerificationType {
  if (values === undefined) {
    return SubmitVerificationType.SKIP;
  }
  if (values === null || !values.length) {
    return SubmitVerificationType.SET_NULL;
  }
  const { submitType, store, relationStore, relationFields, referenceFields } = field;
  if (submitType === SubmitType.none) {
    return SubmitVerificationType.SKIP;
  }
  if (store || !relationFields.length || !referenceFields.length) {
    return SubmitVerificationType.ERROR;
  }
  if (relationStore && relationFields.length && referenceFields.length) {
    return SubmitVerificationType.SUCCESS;
  }
  return SubmitVerificationType.ERROR;
}

function collectionResult(field: RuntimeM2MField, values: ActiveRecord[]): Record<string, unknown>[] | undefined {
  const { referenceFields } = field;
  const submitValues: Record<string, unknown>[] = [];
  let isSubmit = true;
  for (const value of values) {
    if (value === null || !Object.keys(value).length) {
      continue;
    }
    const submitValue: Record<string, unknown> = {};
    for (let i = 0; i < referenceFields.length; i++) {
      const referenceField = referenceFields[i];
      let targetValue;
      if (isStaticRelationField(referenceField)) {
        targetValue = getStaticRelationField(referenceField);
      } else {
        targetValue = value[referenceField];
      }
      if (targetValue == null) {
        isSubmit = false;
        break;
      }
      submitValue[referenceField] = targetValue;
    }
    if (isSubmit) {
      submitValues.push(submitValue);
    } else {
      break;
    }
  }
  if (isSubmit) {
    return submitValues;
  }
}

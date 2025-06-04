import { ModelFieldType } from '@oinone/kunlun-meta';
import { Optional } from '@oinone/kunlun-shared';
import { isRelationField, RELATION_FIELD_TTYPES } from '../../runtime-context';
import { RuntimeModel, RuntimeModelField, RuntimeRelationField } from '../../runtime-metadata';

export class MetadataHelper {
  public static buildSimpleModelField(
    model: string,
    modelName: string,
    options: {
      data: string;
      name?: string;
      ttype: ModelFieldType;
      references?: string;
      referencesModel?: RuntimeModel;
      store?: boolean;
      relationStore?: boolean;
      displayName?: string;
    }
  ): RuntimeModelField {
    const { data, name, ttype, references, referencesModel, store, relationStore, displayName } = options;
    let defaultStore = true;
    let defaultRelationStore = false;
    if (RELATION_FIELD_TTYPES.includes(options.ttype)) {
      defaultStore = false;
      defaultRelationStore = true;
    }
    const modelField: RuntimeModelField | RuntimeRelationField = {
      model,
      modelName,
      data,
      name: name || data,
      ttype,
      store: Optional.ofNullable(store).orElse(defaultStore),
      relationStore: Optional.ofNullable(relationStore).orElse(defaultRelationStore),
      displayName
    };
    if (references && isRelationField(modelField)) {
      modelField.references = references;
      if (referencesModel) {
        modelField.referencesModel = referencesModel;
      }
    }
    return modelField;
  }
}

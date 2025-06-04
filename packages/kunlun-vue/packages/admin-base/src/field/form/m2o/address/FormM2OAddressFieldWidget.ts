import { ActiveRecord, ActiveRecordExtendKeys, parseConfigs, SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, CastHelper, ObjectUtils, Optional, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { TreeNodeResponseBody, TreeService } from '../../../../service';
import { TreeData, TreeNodeMetadata } from '../../../../typing';
import { FetchUtil } from '../../../../util';
import { generatorDefaultAddressTreeDefinition } from '../../../../util/default-tree-definition';
import { FormM2OCascaderFieldWidget } from '../cascader/FormM2OCascaderFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Address'
  })
)
export class FormM2OAddressFieldWidget extends FormM2OCascaderFieldWidget {
  @Widget.Reactive()
  protected get changeOnSelect(): boolean {
    return Optional.ofNullable(this.getDsl().changeOnSelect).map(BooleanHelper.toBoolean).orElse(true)!;
  }

  protected generatorDefaultTreeDefinition(props) {
    return generatorDefaultAddressTreeDefinition();
  }

  protected getSubmitField(metadata: TreeNodeMetadata): Record<string, string> | undefined {
    let submitFields = metadata.submitFields as Record<string, string> | null | undefined;
    if (submitFields === undefined) {
      submitFields = CastHelper.cast<Record<string, string>>(
        parseConfigs(metadata, { key: 'submitFields', prefix: 'submit' }).submitFields
      );
      if (!Object.keys(submitFields).length) {
        console.error('Invalid submit fields.', metadata);
        submitFields = null;
      }
      metadata.submitFields = submitFields;
    }
    if (submitFields) {
      return submitFields;
    }
    if (submitFields === null) {
      return undefined;
    }
    return submitFields;
  }

  protected $onSelectedChange(selectedNodes: OioTreeNode<TreeData>[] | null | undefined) {
    if (selectedNodes === undefined) {
      return;
    }
    if (selectedNodes === null) {
      this.change(null);
      return;
    }
    let selectedNode: OioTreeNode<TreeData> | undefined = selectedNodes[0];
    if (!selectedNode) {
      this.change(null);
      return;
    }
    const { value } = this;
    let currentValue: ActiveRecord | undefined;
    if (value) {
      currentValue = FetchUtil.generatorPksObjectByPks(['id'], value);
      if (currentValue) {
        Object.values(ActiveRecordExtendKeys).forEach((key) => {
          ObjectUtils.safeSetter(currentValue, value, key);
        });
      }
    }
    if (!currentValue) {
      currentValue = {
        __draftId: uniqueKeyGenerator()
      };
    }
    while (selectedNode) {
      const targetValue = selectedNode.value.data;
      if (targetValue) {
        const submitFields = this.getSubmitField(selectedNode.value.metadata);
        if (submitFields) {
          Object.entries(submitFields).forEach(([relationField, referenceField]) => {
            currentValue![relationField] = targetValue[referenceField as string];
          });
        }
      }
      selectedNode = selectedNode.parent;
    }
    this.change(currentValue);
  }

  protected async fetchBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): Promise<TreeNodeResponseBody[] | undefined> {
    const finalValues: ActiveRecord[] = [];
    let finalMetadataList: TreeNodeMetadata[] | undefined;
    for (const currentValue of currentValues) {
      let targetValue: ActiveRecord = {};
      for (let i = metadataList.length - 1; i >= 0; i--) {
        const metadata = metadataList[i];
        const submitFields = this.getSubmitField(metadata);
        if (submitFields) {
          for (const [relationField, referenceField] of Object.entries(submitFields)) {
            const value = currentValue[relationField];
            if (value) {
              targetValue[referenceField] = value;
            } else {
              targetValue = {};
              break;
            }
          }
          if (Object.keys(targetValue).length) {
            finalValues.push(targetValue);
            finalMetadataList = metadataList.slice(0, i + 1);
            break;
          }
        }
      }
    }
    if (finalMetadataList) {
      return TreeService.reverselyQueryWithSize(finalValues, finalMetadataList, {
        expressionParameters: this.generatorExpressionParameters(),
        disabledIsLeaf: true
      });
    }
    return undefined;
  }

  protected generatorCompareRecords(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): ActiveRecord[] | undefined {
    const compareRecords: ActiveRecord[] = [];
    for (const currentValue of currentValues) {
      for (const metadata of metadataList) {
        let targetValue: ActiveRecord = {};
        const submitFields = this.getSubmitField(metadata);
        if (submitFields) {
          for (const [relationField, referenceField] of Object.entries(submitFields)) {
            const value = currentValue[relationField];
            if (value) {
              targetValue[referenceField] = value;
            } else {
              targetValue = {};
              break;
            }
          }
          if (Object.keys(targetValue).length) {
            compareRecords.push(targetValue);
          }
        }
      }
    }
    if (!compareRecords.length) {
      return undefined;
    }
    return [compareRecords[compareRecords.length - 1]];
  }

  public async submit(submitValue: SubmitValue) {
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, this.value);
  }
}

import {
  ActiveRecord,
  ActiveRecordExtendKeys,
  ExperimentalConfigManager,
  parseConfigs,
  SubmitHandler,
  SubmitValue
} from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import {
  BooleanHelper,
  CastHelper,
  ObjectUtils,
  Optional,
  StandardString,
  uniqueKeyGenerator
} from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { TreeNodeResponseBody, TreeService } from '../../../../service';
import { AddressTypeEnum, ResourceAddress, ResourceRegion, TreeData, TreeNodeMetadata } from '../../../../typing';
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
  public static readonly AddressTypes = [
    AddressTypeEnum.Street,
    AddressTypeEnum.District,
    AddressTypeEnum.City,
    AddressTypeEnum.Province,
    AddressTypeEnum.Country
  ];

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
    let currentValue: ResourceAddress | undefined;
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
    if (ExperimentalConfigManager.addressWidgetNext()) {
      this.$onSelectedChangeNext(currentValue, selectedNode);
    } else {
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
    }
    this.change(currentValue);
  }

  protected $onSelectedChangeNext(currentValue: ResourceAddress, selectedNode: OioTreeNode<TreeData> | undefined) {
    let nextAddressType: AddressTypeEnum | null | undefined = AddressTypeEnum.Street;
    while (selectedNode) {
      const targetValue = selectedNode.value.data as ResourceRegion | undefined;
      if (!targetValue) {
        selectedNode = selectedNode.parent;
        continue;
      }
      const { type, code, name } = targetValue;
      if (!type) {
        console.error('Invalid region type.', selectedNode);
        this.change(null);
        return;
      }
      if (nextAddressType) {
        while (type !== nextAddressType) {
          nextAddressType = this.setResourceAddressValue(currentValue, nextAddressType, null, null);
          if (nextAddressType === null) {
            break;
          }
          if (!nextAddressType) {
            return;
          }
        }
      } else {
        nextAddressType = type;
      }
      nextAddressType = this.setResourceAddressValue(currentValue, type, code, name);
      if (nextAddressType === null) {
        break;
      }
      if (!nextAddressType) {
        return;
      }
      selectedNode = selectedNode.parent;
    }
  }

  protected getResourceAddressValue(
    currentValue: ResourceAddress,
    type: AddressTypeEnum
  ):
    | {
        code: StandardString;
        name: StandardString;
      }
    | undefined {
    switch (type) {
      case AddressTypeEnum.Country: {
        const { countryCode, countryName } = currentValue;
        if (countryCode && countryName) {
          return { code: countryCode, name: countryName };
        }
        return undefined;
      }
      case AddressTypeEnum.Province: {
        const { provinceCode, provinceName } = currentValue;
        if (provinceCode && provinceName) {
          return { code: provinceCode, name: provinceName };
        }
        return undefined;
      }
      case AddressTypeEnum.City: {
        const { cityCode, cityName } = currentValue;
        if (cityCode && cityName) {
          return { code: cityCode, name: cityName };
        }
        return undefined;
      }
      case AddressTypeEnum.District: {
        const { districtCode, districtName } = currentValue;
        if (districtCode && districtName) {
          return { code: districtCode, name: districtName };
        }
        return undefined;
      }
      case AddressTypeEnum.Street: {
        const { streetCode, streetName } = currentValue;
        if (streetCode && streetName) {
          return { code: streetCode, name: streetName };
        }
        return undefined;
      }
      default:
        console.error('Invalid region type.', type);
        return undefined;
    }
  }

  protected setResourceAddressValue(
    currentValue: ResourceAddress,
    type: AddressTypeEnum,
    code: StandardString,
    name: StandardString
  ): AddressTypeEnum | null | undefined {
    switch (type) {
      case AddressTypeEnum.Country:
        currentValue.countryCode = code;
        currentValue.countryName = name;
        return null;
      case AddressTypeEnum.Province:
        currentValue.provinceCode = code;
        currentValue.provinceName = name;
        return AddressTypeEnum.Country;
      case AddressTypeEnum.City:
        currentValue.cityCode = code;
        currentValue.cityName = name;
        return AddressTypeEnum.Province;
      case AddressTypeEnum.District:
        currentValue.districtCode = code;
        currentValue.districtName = name;
        return AddressTypeEnum.City;
      case AddressTypeEnum.Street:
        currentValue.streetCode = code;
        currentValue.streetName = name;
        return AddressTypeEnum.District;
      default:
        console.error('Invalid region type.', type);
        this.change(null);
        return undefined;
    }
  }

  protected async fetchBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): Promise<TreeNodeResponseBody[] | undefined> {
    if (ExperimentalConfigManager.addressWidgetNext()) {
      return this.fetchBackfillDataNext(currentValues, metadataList);
    }
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

  protected async fetchBackfillDataNext(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): Promise<TreeNodeResponseBody[] | undefined> {
    const currentValue = currentValues[0] as ResourceAddress | undefined;
    if (!currentValue) {
      return undefined;
    }
    let lastRegion: ResourceRegion | undefined;
    for (const type of FormM2OAddressFieldWidget.AddressTypes) {
      lastRegion = this.getResourceAddressValue(currentValue, type);
      if (lastRegion) {
        break;
      }
    }
    if (lastRegion) {
      return TreeService.reverselyQueryWithSize([lastRegion], metadataList, {
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
    if (ExperimentalConfigManager.addressWidgetNext()) {
      return this.generatorCompareRecordsNext(currentValues, metadataList);
    }
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

  protected generatorCompareRecordsNext(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): ActiveRecord[] | undefined {
    const currentValue = currentValues[0] as ResourceAddress | undefined;
    if (!currentValue) {
      return undefined;
    }
    let lastRegion: ResourceRegion | undefined;
    for (const type of FormM2OAddressFieldWidget.AddressTypes) {
      lastRegion = this.getResourceAddressValue(currentValue, type);
      if (lastRegion) {
        break;
      }
    }
    if (lastRegion) {
      return [lastRegion];
    }
    return undefined;
  }

  public async submit(submitValue: SubmitValue) {
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, this.value);
  }
}

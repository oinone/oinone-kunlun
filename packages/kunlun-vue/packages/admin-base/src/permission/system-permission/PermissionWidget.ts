import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../basic';

import CustomView from './Permission.vue';
import { IPermissionDslActions } from './types';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'permission-view' }))
export class PermissionWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CustomView);
    return this;
  }

  @Widget.Reactive()
  protected get dslActions() {
    const widgets = this.metadataRuntimeContext.viewDsl?.widgets || [];
    return widgets.find((w) => w.slot === 'actions')?.widgets || [];
  }

  @Widget.Reactive()
  protected get permissionActions(): IPermissionDslActions {
    return {
      hasModifyRoleAction: !!this.dslActions.find((a) => a.name === 'modifyRole'),
      hasModifyManagementRoleAction: !!this.dslActions.find((a) => a.name === 'modifyManagementRole'),
      hasPermissionUpdateAction: !!this.dslActions.find((a) => a.name === 'update'),
      hasPermissionCreateAction: !!this.dslActions.find((a) => a.name === 'create'),
      hasPermissionCreateBatchAction: !!this.dslActions.find((a) => a.name === 'authorizes'),
      hasActiveGroupAction: !!this.dslActions.find((a) => a.name === 'active'),
      hasCancelGroupAction: !!this.dslActions.find((a) => a.name === 'disable'),
      hasDeleteGroupAction: !!this.dslActions.find((a) => a.name === 'deleteOne'),
      hasCollectionPermissionItemsAction: !!this.dslActions.find((a) => a.name === 'collectionPathMappings'),
      hasAuthGroupSystemPermissionLookupAction: !!this.dslActions.find(
        (a) => a.name === 'authGroupSystemPermissionLookup'
      )
    };
  }
}

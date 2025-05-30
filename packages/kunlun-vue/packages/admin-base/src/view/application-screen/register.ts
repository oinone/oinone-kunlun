import { ViewType } from '@kunlun/meta';
import { LayoutManager, MaskManager } from '../../spi';

MaskManager.register(
  {
    moduleName: 'apps',
    actionName: 'homepage'
  },
  `<mask>
    <multi-tabs />
    <header>
        <widget widget="app-switcher" />
        <block>
            <widget widget="notification" />
            <widget widget="divider" />
            <widget widget="language" />
            <widget widget="divider" />
            <widget widget="user" />
        </block>
    </header>
    <container>
      <content>
          <block height="100%" width="100%">
              <widget width="100%" widget="main-view"/>
          </block>
      </content>
    </container>
</mask>`
);

LayoutManager.register(
  {
    moduleName: 'apps',
    viewName: 'apps_module_gallery',
    viewType: ViewType.Gallery
  },
  `<view type="TABLE">
      <element widget="actionBar" invisible="true" slot="actionBar" slotSupport="action">
          <xslot name="actions" slotSupport="action" />
      </element>
      <element widget="ApplicationScreenWidget" slot="table" slotSupport="field">
         <template slot="galleryWidget">
            <element widget="AppsGallery">
               <template slot="AppsSearch">
                  <view type="SEARCH">
                     <element widget="search" cols="4" slot="search" slotSupport="field" />
                  </view>
               </template>
            </element>
         </template>
         <template slot="techVisualization">
            <element widget="TechVisualizationWidget" />
         </template>
         <template slot="appsBusinessScreen">
            <element widget="AppsBusinessScreen" />
         </template>
      </element>
   </view>`
);

MaskManager.register(
  {
    moduleName: 'designerMetadata',
    actionName: [
      'modelDesignerFilter',
      'uiDesignerFilter',
      'wfDesignerFilter',
      'mfDesignerFilter',
      'eipDesignerFilter',
      'dataDesignerFilter',
      'printDesignerFilter',

      'modelDesignerSyncFilter',
      'uiDesignerSyncFilter',
      'wfDesignerSyncFilter',
      'mfDesignerSyncFilter',
      'eipDesignerSyncFilter',
      'dataDesignerSyncFilter',
      'printDesignerSyncFilter'
    ]
  },
  `<mask>
     <multi-tabs />
     <header>
         <widget widget="app-switcher" />
         <block>
             <widget widget="notification" />
             <widget widget="divider" />
             <widget widget="language" />
             <widget widget="divider" />
             <widget widget="user" />
         </block>
     </header>
     <container>
       <content>
           <block height="100%" width="100%">
               <widget width="100%" widget="main-view"/>
           </block>
       </content>
     </container>
 </mask>`
);

const exportActionWithLayoutConfig = [
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.ModelDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'modelDesignerFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.UIDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'uiDesignerFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.WFDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'wfDesignerFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.MFDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'mfDesignerFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.EipDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'eipDesignerFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.DataDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'dataDesignerFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.PrintDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'printDesignerFilter'
  },

  {
    moduleName: 'designerMetadata',
    model: 'dmeta.ModelDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'modelDesignerSyncFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.UIDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'uiDesignerSyncFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.WFDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'wfDesignerSyncFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.EipDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'eipDesignerSyncFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.DataDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'dataDesignerSyncFilter'
  },
  {
    moduleName: 'designerMetadata',
    model: 'dmeta.PrintDesignerMetaExport',
    viewType: ViewType.Detail,
    actionName: 'printDesignerSyncFilter'
  }
];

exportActionWithLayoutConfig.forEach((config) => {
  LayoutManager.register(
    config,
    `
      <view type="DETAIL">
          <element widget="ImportAndExportElement">
             <template slot="default">
                <element widget="detail" slot="detail">
                   <xslot name="fields" slotSupport="pack,field" />
                </element>
             </template>
             <template slot="action">
                <element widget="actionBar" slot="actionBar" slotSupport="action">
                   <xslot name="actions" slotSupport="action" />
                </element>
             </template>
          </element>
       </view>
      `
  );
});

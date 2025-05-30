import { translateValueByKey } from '@kunlun/engine';
// import { UI_DESIGNER, WidgetCategoryGroup, WidgetCategoryList } from '@kunlun/ui-designer-core';
import { HttpClient } from '@kunlun/request';

const http = HttpClient.getInstance();

// export async function fetchNeedSortWidget() {
//   const body = `
//   query{
//     uiDesignerWidgetDefinitionQuery{
//         queryPage(page:{currentPage:1, size: 20000, sort:{orders:[{field: "priority", direction: ASC}]}},queryWrapper:{rsql:"sys==0 and show==1"}) {
//             content {
//                 id
//                 name
//                 displayName
//                 icon
//                 widgetCategory
//                 priority
//             }
//         }
//     }
// }
//   `;

//   const result = (await http.query(UI_DESIGNER, body)) as any;
//   const sortResult = result.data.uiDesignerWidgetDefinitionQuery.queryPage.content;
//   const fieldGroup = WidgetCategoryList[1];
//   return [
//     {
//       ...fieldGroup,
//       displayName: translateValueByKey(fieldGroup.displayName),
//       allowDraggable: true,
//       items: sortResult
//     }
//   ];
// }

export async function sortWidget(targetId, aheadId?, groupName?) {
  let aheadGql = '';
  if (aheadId) {
    aheadGql = `, ahead: { id: "${aheadId}" }`;
  }

  let widgetGroup = `widgetGroup: {}`;
  if (groupName) {
    widgetGroup = `widgetGroup: {name: "${groupName}"}`;
  }

  const body = `
     mutation {
      uiDesignerWidgetDefinitionProxy4CustomMutation {
        drag(target: { id: "${targetId}", ${widgetGroup} }${aheadGql} ) {
          id
        }
      }
    }
      `;

  // const result = (await http.query(UI_DESIGNER, body)) as any;
  // return result.data.uiDesignerWidgetDefinitionProxy4CustomMutation.drag.id;
}

// export async function fetchSortWidgetResult() {
//   const body = `
//      query{
//     uiDesignerWidgetDefinitionQuery{
//         queryPage(page:{currentPage:1, size: 20000, sort:{orders:[{field: "priority", direction: ASC}]}},queryWrapper:{rsql:"show==1"}) {
//             content {
//                 id
//                 name
//                 displayName
//                 icon
//                 widgetCategory
//                 priority
//             }
//         }
//     }
// }
//   `;

//   const result = (await http.query(UI_DESIGNER, body)) as any;
//   const widgetList = result.data.uiDesignerWidgetDefinitionQuery.queryPage.content;
//   const categoryGroup = new Map<string, WidgetCategoryGroup>();
//   const categoryGroupList = [] as Record<string, any>;
//   for (const group of WidgetCategoryList) {
//     const item = {
//       ...group,
//       displayName: translateValueByKey(group.displayName),
//       allowDraggable: false,
//       items: []
//     };
//     categoryGroup.set(group.name.toString(), item);
//     categoryGroupList.push(item);
//   }
//   for (const widget of widgetList) {
//     categoryGroup.get(widget.widgetCategory)?.items.push(widget);
//   }
//   return categoryGroupList;
// }

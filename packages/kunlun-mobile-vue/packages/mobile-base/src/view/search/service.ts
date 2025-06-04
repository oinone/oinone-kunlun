import { http } from '@oinone/kunlun-service';
import { provide, inject } from 'vue';

const SearchUserPreferProvider = 'SearchUserPreferProvider';

export function provideSearchPreferFun(
  currentSelectedSearchPreferOption,
  fetchUserQueryPreferEntity,
  preferSearch,
  searchReset,
  genUserQueryPreferKey,
  collectionOptions
) {
  provide(SearchUserPreferProvider, {
    currentSelectedSearchPreferOption,
    fetchUserQueryPreferEntity,
    preferSearch,
    searchReset,
    genUserQueryPreferKey,
    collectionOptions
  });
}
export function injectSearchPreferFun() {
  return inject(SearchUserPreferProvider);
}

export async function querySearchPreferByUserId(resModel, resViewName) {
  const body = `
     query{
        userQueryPreferStoreQuery {
            queryPage(page:{size: 500, currentPage: 1}, queryWrapper:{rsql: "partnerId == $\{currentUser\} and resModel == '${resModel}' and resViewName == '${resViewName}'"}) {
                content{
                    id
                    partnerId
                    resModel
                    searchPrefer
                    name
                }
            }
        }
    }
  `;
  const result = await http.mutate('user', body);
  return result.data.userQueryPreferStoreQuery.queryPage.content;
}

export async function createUserQueryPrefer(name, prefer, resModel, resViewName) {
  const body = `
      mutation {
      userQueryPreferStoreMutation {
        create(data: {name: "${name}", searchPrefer:${prefer}, resModel:"${resModel}", resViewName: "${resViewName}"}){
         id
         name
         resModel
         resViewName
         partnerId
        }
      }
    }
  `;
  const result = await http.mutate('user', body);
  return result.data.userQueryPreferStoreMutation.create;
}

export async function updateUserQueryPreferName(id, name) {
  const body = `
       mutation{
        userQueryPreferStoreMutation {
            update(data:{
                id:"${id}",
                name:"${name}"
            }) {
                id
                name
            }
        }
    }
  `;
  const result = await http.mutate('user', body);
  return result.data.userQueryPreferStoreMutation.create;
}

export async function deleteUserQueryPrefer(id) {
  const body = `
     mutation{
        userQueryPreferStoreMutation {
            delete(dataList:[{
                id:"${id}"
            }]){
                id
            }
        }
    }
  `;
  const result = await http.mutate('user', body);
  return result.data.userQueryPreferStoreMutation.delete;
}

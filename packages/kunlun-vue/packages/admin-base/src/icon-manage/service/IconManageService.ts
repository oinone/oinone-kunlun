import { Pagination } from '@oinone/kunlun-engine';
import { HttpClient, Condition } from '@oinone/kunlun-request';

const http = HttpClient.getInstance();

export type IconData = {
  id?: string;
  outId?: string;
  name?: string;
  show?: boolean;
  sys?: boolean;
  fontClass?: string;
  fullFontClass?: string;
  displayName?: string;
  groupId?: number;
  unicode?: string;
  unicode_decimal?: string;
};

export type IconGroup = {
  id: string;
  sys?: boolean;
  name: string;
  libId?: string;
  iconNum?: string;
};

export type IconUpload = {
  cssUrls: string[];
  fontUrls: string[];
  jsUrls: string[];
  iconGroupList: IconGroup[];
  libId: string;
};

export async function fetchAllGroup(model: string) {
  const body = `
  query{
    resourceIconGroupQuery {
      queryAllGroupData {
        name
        id
        sys
        iconNum
      }
    }
}`;

  const result = (await http.query(model, body)) as any;
  return result.data.resourceIconGroupQuery.queryAllGroupData;
}

export async function fetchGroupWithoutCount(model: string) {
  const body = `
  query{
    resourceIconGroupQuery {
      queryGroupData {
        name
        id
        sys
      }
    }
}`;

  const result = (await http.query(model, body)) as any;
  return result.data.resourceIconGroupQuery.queryGroupData;
}

export async function queryIconsWithCondition(options: {
  model: string;
  pagination: Pagination;
  condition: Condition | string;
}) {
  const body = `
  query {
    resourceIconQuery {
      queryPage(
        page: { currentPage: ${options.pagination.current}, size: ${options.pagination.pageSize} }
        queryWrapper: {
          rsql: "${options.condition.toString()}"
          queryData: { type: "ICONFONT" }
        }
      ) {
        size
        aggs
        totalElements
        totalPages
        content{
          id
          outId
				  displayName
				  fullFontClass
				  sys
          show
				  groupId
        }
      }
    }
  }`;

  const result = (await http.query(options.model, body)) as any;
  return result.data.resourceIconQuery.queryPage;
}

export async function iconZipUpload(options: {
  model: string;
  iconData?: IconData;
  urls: string[];
}): Promise<IconUpload[] | undefined> {
  const body = `
  query {
  	resourceIconUploadQuery {
  		uploads(
  			uploadUrl: {
  				urls: [${options.urls.join(',')}]
  				sys: false
  			}
  		) {
  			cssUrls
  			jsUrls
  			fontUrls
        libId
			  iconGroupList {
				  name
				  id
			  }
  		}
  	}
  }
  `;

  const result = (await http.query(options.model, body)) as any;
  return result.data.resourceIconUploadQuery.uploads as IconUpload[];
}

export async function createGroup(options: {
  model: string;
  name: string; // 分组名
}) {
  const body = `
  mutation {
    resourceIconGroupMutation {
      create(data: { name: "${options.name}"}) {
        name
        sys
        id
      }
    }
  }
  `;

  const result = (await http.query(options.model, body)) as any;
  return result.data;
}

export async function modifyGroup(options: {
  model: string;
  name: string; // 分组名
  id: string;
}) {
  const body = `
  mutation{
    resourceIconGroupMutation{
      update(data: {name: "${options.name}",id: "${options.id}"}) {
        name
      }
    }
  }
  `;

  const result = (await http.query(options.model, body)) as any;
  return result.data;
}

export async function deleteGroup(options: {
  model: string;
  name: string; // 分组名
  id: string;
}) {
  const body = `
  mutation {
    resourceIconGroupMutation {
      deleteOne(data: {name: "${options.name}" , id: "${options.id}"}){
        name
      }
    }
  }
  `;

  const result = (await http.query(options.model, body)) as any;
  return result.data;
}

export async function queryIconWithFullFontClass(options: { model: string; fullFontClass: string }) {
  const body = `
  query {
    resourceIconQuery {
      queryIconWithFullFontClass(fullFontClass: "${options.fullFontClass}"){
        id
        fullFontClass
        groupId
      }
    }
  }
  `;

  const result = (await http.query(options.model, body)) as any;
  return result.data.resourceIconQuery.queryIconWithFullFontClass;
}

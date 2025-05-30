import { HttpClient } from '@kunlun/request';
import { RuntimeAction } from '@kunlun/engine';

const http = HttpClient.getInstance();

const UI_DESIGNER = 'uiDesigner';

export const queryAction = async (model: string) => {
  const mutation = `query {
	uiDesignerActionQuery {
		queryActions(data: { model: "${model}" }) {
			id
			actionType
			displayName
			label
			bitOptions
			attributes
			model
			sys
			modelName
			systemSource
			name
			sign
			hash
			bindingType
			bindingViewName
			contextType
			summary
			description
			disable
			invisible
			rule
			mapping
			context
			priority
			createDate
			writeDate
			createUid
			writeUid
		}
	}
}
`;
  const result = await http.mutate(UI_DESIGNER, mutation);
  return result.data['uiDesignerActionQuery']['queryActions'] as unknown as RuntimeAction[];
};

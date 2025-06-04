import { http } from '@oinone/kunlun-service';
import { ModelCache } from '../cache';
import { CurrentLanguage } from '../user';

export interface IResourceDateFormat {
  hyphen: string;
  slash: string;
  chinese: string;
  hyphenYearMonth: string;
  slashYearMonth: string;
  chineseYearMonth: string;
}

export interface IResourceTimeFormat {
  apColonNormal: string;
  colonNormal: string;
  apColonShort: string;
  colonShort: string;
}

export interface IResourceDateTimeFormat {
  resourceDateFormat: IResourceDateFormat;
  resourceTimeFormat: IResourceTimeFormat;
}

let resourceFormat: Promise<IResourceDateTimeFormat>;

export function queryResourceDateTimeFormat(): Promise<IResourceDateTimeFormat> {
  if (resourceFormat) {
    return resourceFormat;
  }
  resourceFormat = queryResourceDateTimeFormat0();
  return resourceFormat;
}

async function queryResourceDateTimeFormat0() {
  const model = await ModelCache.get('resource.ResourceLang');

  const existing = model?.modelFields.some((m) => m.name === 'resourceDateFormat');

  if (!existing) {
    return {
      resourceDateFormat: {},
      resourceTimeFormat: {}
    } as IResourceDateTimeFormat;
  }

  const code = await CurrentLanguage.getCode();

  const body = `{
  resourceLangQuery {
    queryOne(query: {code: "${code}"}) {
      code
      resourceDateFormat {
        hyphen
        slash
        chinese
        hyphenYearMonth
        slashYearMonth
        chineseYearMonth
        hyphenMap
        slashMap
        chineseMap
        hyphenYearMonthMap
        slashYearMonthMap
        chineseYearMonthMap
      }
      resourceTimeFormat {
        apColonNormal
        colonNormal
        apColonShort
        colonShort
        apColonNormalMap
        colonNormalMap
        apColonShortMap
        colonShortMap
      }
    }
  }
}
`;
  return ((await http.query('resource', body)).data.resourceLangQuery.queryOne ||
    {}) as unknown as IResourceDateTimeFormat;
}

import { http } from '@oinone/kunlun-service';
import { queryResourceDateTimeFormat } from '../src/resource-format-service';

jest.mock('@oinone/kunlun-service', () => {
  return {
    http: {
      query: jest.fn()
    }
  };
});

describe('resource-format-service', () => {
  beforeEach(() => {
    (http.query as jest.Mock).mockReset();
    (http.query as jest.Mock).mockResolvedValue({
      data: {
        resourceLangQuery: {
          queryOne: {
            resourceDateFormat: {
              hyphen: 'YYYY-MM-DD',
              slash: 'YYYY/MM/DD',
              chinese: 'YYYY年MM月DD日',
              hyphenYearMonth: 'YYYY-MM',
              slashYearMonth: 'YYYY/MM',
              chineseYearMonth: 'YYYY年MM月'
            },
            resourceTimeFormat: {
              apColonNormal: 'hh:mm:ss A',
              colonNormal: 'HH:mm:ss',
              apColonShort: 'hh:mm A',
              colonShort: 'HH:mm'
            }
          }
        }
      }
    });
  });

  it('queryResourceDateTimeFormat fetches and returns date time format', async () => {
    const result = await queryResourceDateTimeFormat();
    expect(result.resourceDateFormat.hyphen).toBe('YYYY-MM-DD');
    expect(result.resourceTimeFormat.colonShort).toBe('HH:mm');
    expect(http.query).toHaveBeenCalledTimes(1);
  });

  it('queryResourceDateTimeFormat reuses same promise instance on multiple calls', async () => {
    const promise1 = queryResourceDateTimeFormat();
    const promise2 = queryResourceDateTimeFormat();
    expect(promise1).toBe(promise2);
    await promise1;
  });
});

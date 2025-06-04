import { translateValueByKey } from '@oinone/kunlun-engine';
import { ResourceDateTimeOption } from '@oinone/kunlun-shared';

/**
 * 每个选项的ID不可修改
 *   options中每项的code 不可修改
 */
export const getResourceTimeFormatOptions = (): ResourceDateTimeOption[] => {
  return [
    {
      displayName: translateValueByKey('上午/下午'),
      width: '80px',
      code: 'A',
      id: 'A',
      concat: '',
      options: [
        {
          displayName: translateValueByKey('下午'),
          code: 'A',
          id: 'CA'
        }
      ]
    },
    {
      displayName: translateValueByKey('小时'),
      code: 'h',
      id: 'H',
      concat: '',
      options: [
        {
          displayName: '1-12',
          showName: '1',
          code: 'h',
          id: 'Ch'
        },
        {
          displayName: '01-12',
          showName: '01',
          code: 'hh',
          id: 'Chh'
        },
        {
          displayName: '1-24',
          showName: '13',
          code: 'H',
          id: 'CH'
        },
        {
          displayName: '01-24',
          showName: '13',
          code: 'HH',
          id: 'CHH'
        }
      ]
    },
    {
      displayName: translateValueByKey('分钟'),
      code: 'm',
      id: 'M',
      concat: '',
      options: [
        {
          displayName: '06',
          code: 'mm',
          id: 'Cmm'
        },
        {
          displayName: '6',
          code: 'm',
          id: 'Cm'
        }
      ]
    },
    {
      displayName: translateValueByKey('秒钟'),
      code: 's',
      id: 'S',
      concat: '',
      options: [
        {
          displayName: '06',
          code: 'ss',
          id: 'Css'
        },
        {
          displayName: '6',
          code: 's',
          id: 'Cs'
        }
      ]
    }
  ];
};

/**
 * 每个选项的ID不可修改
 *   options中每项的code 不可修改
 */
export const getResourceDateFormatOptions = (): ResourceDateTimeOption[] => {
  return [
    {
      displayName: translateValueByKey('年'),
      code: 'YYYY',
      id: 'Y',
      concat: '',
      options: [
        {
          displayName: '2024',
          code: 'YYYY',
          id: 'CYYYY'
        },
        {
          displayName: '24',
          code: 'YY',
          id: 'CYY'
        }
      ]
    },
    {
      displayName: translateValueByKey('月'),
      code: 'MMMM',
      id: 'M',
      concat: '',
      options: [
        {
          displayName: translateValueByKey('六月'),
          code: 'MMMM',
          id: 'CMMMM'
        },
        {
          displayName: translateValueByKey('6月'),
          code: 'M月',
          id: 'CM月'
        },
        {
          displayName: '6',
          code: 'M',
          id: 'CM'
        },
        {
          displayName: '06',
          code: 'MM',
          id: 'CMM'
        }
      ]
    },
    {
      displayName: translateValueByKey('日'),
      code: 'DD',
      id: 'D',
      concat: '',
      options: [
        {
          displayName: '01',
          code: 'DD',
          id: 'CDD'
        },
        {
          displayName: '1',
          code: 'D',
          id: 'CD'
        }
      ]
    }
  ];
};

/**
 * @jest-environment jsdom
 */

import { SPI, SPITokenFactory, SPISingleSelector, ServiceIdentifier } from '../src';
import 'reflect-metadata';
import { container } from '../src/spring/container';
import { ServicePriorityManager } from '../src/spring/annotation/priority';

describe('SPI', () => {
  beforeEach(() => {
    container.unbindAll();
    ServicePriorityManager['store'].clear();
  });
  describe('Base & ClassFactory', () => {
    @SPI.Base('Test', ['viewType', 'widget', 'viewName'])
    class BaseTestWidget {
      public static Token: SPITokenFactory<{
        viewType?: string;
        widget?: string;
        viewName?: string;
      }>;

      public static Selector: SPISingleSelector<
        {
          viewType?: string;
          widget?: string;
          viewName?: string;
        },
        string
      >;

      constructor() {
        console.log('BaseTestWidget');
      }
    }

    it('正确挂载Selector与Token', () => {
      expect(BaseTestWidget.Selector).toBeInstanceOf(Function);
      expect(BaseTestWidget.Token).toBeInstanceOf(Function);
    });

    it('正确注册获取', () => {
      @SPI.ClassFactory(
        BaseTestWidget.Token({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      )
      class TestWidget {
        constructor() {
          console.log('TestWidget');
        }
      }

      expect(
        BaseTestWidget.Selector({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      ).toEqual(TestWidget);
    });

    it('在不使用replace时，使用最新的', () => {
      @SPI.ClassFactory(
        BaseTestWidget.Token({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      )
      class TestWidget {
        constructor() {
          console.log('TestWidget');
        }
      }

      @SPI.ClassFactory(
        BaseTestWidget.Token({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      )
      class TestWidget1 {
        constructor() {
          console.log('TestWidget');
        }
      }

      expect(
        BaseTestWidget.Selector({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      ).toEqual(TestWidget1);
    });

    it('允许禁止替换', () => {
      @SPI.ClassFactory(
        BaseTestWidget.Token({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      )
      class TestWidget {
        constructor() {
          console.log('TestWidget');
        }
      }

      @SPI.ClassFactory(
        BaseTestWidget.Token({
          viewType: 'viewType1',
          widget: 'widget1'
        }),
        false
      )
      class TestWidget1 {
        constructor() {
          console.log('TestWidget');
        }
      }

      expect(
        BaseTestWidget.Selector({
          viewType: 'viewType1',
          widget: 'widget1'
        })
      ).toEqual(TestWidget);
    });
  });

  describe('Service', () => {
    const DB_TOKEN = Symbol('Database');

    it('正确注册构建', () => {
      @SPI.Service(DB_TOKEN)
      class SQLiteDB {
        constructor() {
          console.log('SQLiteDB');
        }
      }

      const result = SPI.RawInstantiate(DB_TOKEN);

      expect(result).toBeInstanceOf(SQLiteDB);
    });

    it('相同参数使用最新的', () => {
      @SPI.Service(DB_TOKEN, { name: 'canUseDB', priority: 1 })
      class SQLiteDB {
        constructor() {
          console.log('SQLiteDB');
        }
      }

      @SPI.Service(DB_TOKEN, { name: 'canUseDB', priority: 1 })
      class OracleDB {
        constructor() {
          console.log('OracleDB');
        }
      }

      const result = SPI.RawInstantiate(DB_TOKEN, {
        name: 'canUseDB'
      });

      expect(result).toBeInstanceOf(OracleDB);
    });

    it('使用优先级更高的Class', () => {
      @SPI.Service(DB_TOKEN, { priority: 7 })
      class SQLiteDB {
        constructor() {
          console.log('SQLiteDB');
        }
      }

      @SPI.Service(DB_TOKEN, { priority: 2 })
      class OracleDB {
        constructor() {
          console.log('OracleDB');
        }
      }
      const result = SPI.RawInstantiate(DB_TOKEN);

      console.log(result);
      expect(result).toBeInstanceOf(SQLiteDB);
    });

    it('应实现命名绑定隔离', () => {
      // 注册同名服务不同实现
      @SPI.Service(DB_TOKEN, { name: 'SQLite' })
      class SQLiteDB {}

      @SPI.Service(DB_TOKEN, { name: 'Oracle' })
      class OracleDB {}

      // 验证按名称解析
      expect(SPI.RawInstantiate(DB_TOKEN, { name: 'SQLite' })).toBeInstanceOf(SQLiteDB);

      expect(SPI.RawInstantiate(DB_TOKEN, { name: 'Oracle' })).toBeInstanceOf(OracleDB);
    });

    it('未指定name时获取当前Token下所有绑定', () => {
      @SPI.Service(DB_TOKEN, { priority: 1 })
      class DefaultDB {}

      @SPI.Service(DB_TOKEN, { name: 'Backup', priority: 2 })
      class BackupDB {}

      expect(SPI.RawInstantiate(DB_TOKEN)).toBeInstanceOf(BackupDB);
    });

    it('未指定name时获取当前Token下所有绑定', () => {
      @SPI.Service(DB_TOKEN, { priority: 1 })
      class DefaultDB {}

      @SPI.Service(DB_TOKEN, { name: 'Backup', priority: 2 })
      class BackupDB {}

      expect(SPI.RawInstantiates(DB_TOKEN)).toEqual(
        expect.arrayContaining([expect.any(BackupDB), expect.any(DefaultDB)])
      );
    });
  });

  describe('Autowired', () => {
    const TestServiceToken = ServiceIdentifier('TestServiceToken');

    const TargetServiceToken = ServiceIdentifier('TargetServiceToken');
    it('正确注册构建', () => {
      @SPI.Service(TestServiceToken)
      class TestService {
        constructor() {
          console.log('TestService');
        }
      }

      @SPI.Service(TargetServiceToken)
      class TargetService {
        @SPI.Autowired(TestServiceToken)
        public testService!: TestService;

        constructor() {
          console.log('TargetService');
        }
      }

      const result = SPI.RawInstantiate(TargetServiceToken);

      expect((result as TargetService).testService).toBeInstanceOf(TestService);
    });
  });
});

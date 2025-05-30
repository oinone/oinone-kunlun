import getValue from 'lodash/get';
import { IOioDB, IDBTable } from '../typing';
import { getDB } from '../util';
import { DB_NAME, DB_VERSION } from '../constant';

let oio_db;
export class OioDB implements IOioDB {
  constructor() {}

  public connectDB(table?: IDBTable[] | IDBTable): Promise<void> {
    // FIXME: 兼容方案
    return new Promise((resolve, reject) => {
      const db = getDB();
      if (db) {
        const res = db.open(DB_NAME, DB_VERSION);
        res.onsuccess = (e) => {
          oio_db = getValue(e, 'target.result');
          resolve();
        };
        res.onupgradeneeded = async (e) => {
          oio_db = getValue(e, 'target.result');

          if (!table) {
            resolve();
          }

          if (Array.isArray(table)) {
            table.forEach((table) => {
              this.createTable(table);
            });
          } else if(table) {
            this.createTable(table);
          } else {
            console.error("table init error")
          }
          resolve();
        };
        res.onerror = (e) => {
          console.log(e);
          reject();
        };
      } else {
        console.error('connect db error');
      }
    });
  }

  public async createTable(dbTable: IDBTable): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!dbTable) {
        reject();
      }
      const { name, config, columns } = dbTable;
      const table = oio_db.createObjectStore(name, config);
      (columns || []).forEach((column) => {
        table.createIndex(column, column, { unique: false });
      });
      resolve();
    });
  }

  public insert(tableName: string, data): void {
    oio_db.transaction([tableName], 'readwrite').objectStore(tableName).add(data);
  }

  public async query(tableName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const res = oio_db.transaction([tableName], 'readwrite').objectStore(tableName).get(key);
      res.onsuccess = () => {
        resolve(res.result);
      };
      res.onerror = (event) => {
        console.error(event, tableName, key);
        reject();
      };
    });
  }

  // public getData() {
  //   return {};
  // }

  // public setData() {}
  //
  // public setData() {}
}

export interface IOioDB {
  connectDB(tables?: IDBTable[] | IDBTable): Promise<void>;

  // query(key: string): any;
  insert(tableName: string, data: any): void;
  query(tableName: string, key: string): Promise<any>;
  // delete(key: string): void;
  // update(tableName: string, key: string, value: any);
  //
  // closeTable(): void;
  // closeDB(): void;
  //
  // deleteByCursor(): void;
}

export interface IDBTableConfig {
  keyPath?: string; //主键,
  autoIncrement?: boolean;
}

export interface IDBTable {
  name: string;
  config?: IDBTableConfig;
  columns: string[];
}

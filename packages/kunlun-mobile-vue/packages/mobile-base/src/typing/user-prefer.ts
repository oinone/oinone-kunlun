export interface UserTablePreferFieldWidth {
  field: string;
  width: number;
}

export interface UserTablePrefer {
  id: string;
  model: string;
  viewName: string;

  fieldPrefer: string[];
  fieldOrder: string[];
  fieldLeftFixed: string[];
  fieldRightFixed: string[];
  fieldWidth?: UserTablePreferFieldWidth[];
}

export interface UserSearchPrefer {
  id: string;
  model: string;
  viewName: string;

  name: string;
  searchPrefer: {
    searchBody: Record<string, unknown>;
    searchPreferFields: UserSearchPreferField[];
  };
}

export interface UserSearchPreferField {
  data: string;
  label: string;
}

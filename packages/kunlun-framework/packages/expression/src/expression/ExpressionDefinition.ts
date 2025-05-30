export interface ExpressionRunParam {
  activeRecords: Record<string, unknown>[];
  rootRecord: Record<string, unknown>;
  openerRecord: Record<string, unknown>;
  scene: string | null;
  activeRecord?: Record<string, unknown> | null;
  parentRecord?: Record<string, unknown> | null;
}

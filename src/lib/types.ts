export type Category = "phone" | "laptop" | "tablet";
export type Grade = "A" | "B" | "C" | "D" | "reject";
export type Decision = "buy" | "pass" | "pending";
export type CheckKey =
  | "powersOn"
  | "charges"
  | "display"
  | "touchOrKeyboard"
  | "cameras"
  | "audio"
  | "connectivity"
  | "biometrics"
  | "bodyCondition"
  | "ports";
export type FlagKey =
  | "waterDamage"
  | "replacedParts"
  | "accountLocked"
  | "stolenSuspect";
export type CheckResult = "pass" | "fail" | "skip";

export interface CatalogItem {
  id: string;
  category: Category;
  brand: string;
  model: string;
  storage: string;
  streetAsk: number;
}

export interface IntakeInput {
  staffName: string;
  catalogId: string;
  identifier: string;
  color?: string;
  sellerAsking?: number;
  batteryHealthPct?: number;
  checks: Record<CheckKey, CheckResult>;
  flags: Record<FlagKey, boolean>;
  notes?: string;
}

export interface GradeBreakdown {
  grade: Grade;
  suggestedMaxBuy: number;
  streetAsk: number;
  deductions: { label: string; impact: string }[];
  rejectReason?: string;
}

export interface TwinRef {
  id: string;
  grade: Grade;
  listPrice?: number;
  offerPrice?: number;
  color?: string;
}

export interface DeviceRecord extends IntakeInput {
  id: string;
  createdAt: string;
  brand: string;
  model: string;
  storage: string;
  category: Category;
  grade: Grade;
  suggestedMaxBuy: number;
  streetAsk: number;
  deductions: { label: string; impact: string }[];
  rejectReason?: string;
  decision: Decision;
  offerPrice?: number;
  listPrice?: number;
  warrantyDays?: number;
  customerPitch?: string;
  ownerBrief?: string;
  soldPrice?: number;
  soldAt?: string;
  twins?: TwinRef[];
}

export interface OwnerSummary {
  sheets: number;
  bought: number;
  onShelf: number;
  sold: number;
  pending: number;
  passed: number;
  capitalIn: number;
  listValue: number;
  paperMargin: number;
  realizedMargin: number;
  byStaff: Record<string, number>;
  needsListPrice: number;
  recentBought: DeviceRecord[];
  recentSold: DeviceRecord[];
}

export interface Meta {
  catalog: CatalogItem[];
  checkLabels: Record<CheckKey, string>;
  checkOrder: CheckKey[];
  flagLabels: Record<FlagKey, string>;
  nvidia?: boolean;
}

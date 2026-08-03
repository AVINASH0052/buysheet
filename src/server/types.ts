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
  /** Typical street ask for a clean working unit (INR). Mocked comps. */
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
  /** Shop ask price once bought (INR). */
  listPrice?: number;
  /** Warranty offered to buyer, in days. */
  warrantyDays?: number;
  customerPitch?: string;
  ownerBrief?: string;
  /** Set when the unit leaves the shelf. */
  soldPrice?: number;
  soldAt?: string;
}

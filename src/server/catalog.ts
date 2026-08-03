import type { CatalogItem, CheckKey, FlagKey } from "./types";

export const CHECK_LABELS: Record<CheckKey, string> = {
  powersOn: "Powers on",
  charges: "Charges / holds charge",
  display: "Display (no burn-in / dead pixels)",
  touchOrKeyboard: "Touch / keyboard",
  cameras: "Cameras",
  audio: "Speaker + mic",
  connectivity: "Wi-Fi / cellular radios",
  biometrics: "Fingerprint / Face ID",
  bodyCondition: "Body / chassis (dents, bends)",
  ports: "Ports & buttons",
};

export const FLAG_LABELS: Record<FlagKey, string> = {
  waterDamage: "Water / liquid marks",
  replacedParts: "Non-OEM or replaced parts claimed",
  accountLocked: "iCloud / FRP / account lock",
  stolenSuspect: "IMEI blacklisted or seller story shaky",
};

export const CATALOG: CatalogItem[] = [
  { id: "ip13-128", category: "phone", brand: "Apple", model: "iPhone 13", storage: "128GB", streetAsk: 32000 },
  { id: "ip14-128", category: "phone", brand: "Apple", model: "iPhone 14", storage: "128GB", streetAsk: 42000 },
  { id: "s23-256", category: "phone", brand: "Samsung", model: "Galaxy S23", storage: "256GB", streetAsk: 38000 },
  { id: "pixel7-128", category: "phone", brand: "Google", model: "Pixel 7", storage: "128GB", streetAsk: 22000 },
  { id: "rn12p-256", category: "phone", brand: "Xiaomi", model: "Redmi Note 12 Pro", storage: "256GB", streetAsk: 14000 },
  { id: "mba-m1-256", category: "laptop", brand: "Apple", model: "MacBook Air M1", storage: "256GB", streetAsk: 52000 },
  { id: "t480-512", category: "laptop", brand: "Lenovo", model: "ThinkPad T480", storage: "512GB", streetAsk: 18000 },
  { id: "ipad9-64", category: "tablet", brand: "Apple", model: "iPad 9th gen", storage: "64GB", streetAsk: 16000 },
  { id: "tabs9-128", category: "tablet", brand: "Samsung", model: "Galaxy Tab S9 FE", storage: "128GB", streetAsk: 24000 },
];

export const CHECK_ORDER: CheckKey[] = [
  "powersOn",
  "charges",
  "display",
  "touchOrKeyboard",
  "cameras",
  "audio",
  "connectivity",
  "biometrics",
  "bodyCondition",
  "ports",
];

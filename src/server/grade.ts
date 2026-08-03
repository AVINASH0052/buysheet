import type {
  CatalogItem,
  CheckKey,
  CheckResult,
  FlagKey,
  Grade,
  GradeBreakdown,
  IntakeInput,
} from "./types";

const BUY_RATIO: Record<Exclude<Grade, "reject">, number> = {
  A: 0.72,
  B: 0.58,
  C: 0.42,
  D: 0.28,
};

const GRADE_RANK: Grade[] = ["A", "B", "C", "D", "reject"];

function drop(grade: Grade, steps: number): Grade {
  const i = Math.min(GRADE_RANK.indexOf(grade) + steps, GRADE_RANK.length - 1);
  return GRADE_RANK[i];
}

/**
 * Shop-floor grading: start at A, knock down for real faults.
 * Buy ceiling = streetAsk × ratio(grade), then clip if seller ask is lower.
 *
 * ponytail: streetAsk is a static catalog mid — swap for live marketplace comps later.
 */
export function gradeIntake(
  input: Pick<IntakeInput, "checks" | "flags" | "batteryHealthPct" | "sellerAsking">,
  catalog: CatalogItem
): GradeBreakdown {
  const deductions: GradeBreakdown["deductions"] = [];
  let grade: Grade = "A";

  if (input.flags.stolenSuspect) {
    return {
      grade: "reject",
      suggestedMaxBuy: 0,
      streetAsk: catalog.streetAsk,
      deductions: [{ label: "Stolen / blacklist risk", impact: "hard reject" }],
      rejectReason: "Do not buy. Blacklist or ownership risk.",
    };
  }

  if (input.flags.accountLocked) {
    return {
      grade: "reject",
      suggestedMaxBuy: 0,
      streetAsk: catalog.streetAsk,
      deductions: [{ label: "Account / FRP lock", impact: "hard reject" }],
      rejectReason: "Do not buy until lock is cleared in front of you.",
    };
  }

  if (input.checks.powersOn === "fail") {
    return {
      grade: "reject",
      suggestedMaxBuy: 0,
      streetAsk: catalog.streetAsk,
      deductions: [{ label: "Does not power on", impact: "hard reject" }],
      rejectReason: "Dead unit. Parts only unless you have a repair bench quote.",
    };
  }

  const criticalFails: CheckKey[] = ["display", "touchOrKeyboard", "charges"];
  for (const key of criticalFails) {
    if (input.checks[key] === "fail") {
      grade = drop(grade, 2);
      deductions.push({ label: labelFail(key), impact: "down 2 grades" });
    }
  }

  const softFails: CheckKey[] = [
    "cameras",
    "audio",
    "connectivity",
    "biometrics",
    "bodyCondition",
    "ports",
  ];
  for (const key of softFails) {
    if (input.checks[key] === "fail") {
      grade = drop(grade, 1);
      deductions.push({ label: labelFail(key), impact: "down 1 grade" });
    }
  }

  if (input.flags.waterDamage) {
    grade = drop(grade, 2);
    deductions.push({ label: "Liquid damage signs", impact: "down 2 grades" });
  }

  if (input.flags.replacedParts) {
    grade = drop(grade, 1);
    deductions.push({ label: "Replaced / non-OEM parts", impact: "down 1 grade" });
  }

  const bat = input.batteryHealthPct;
  if (typeof bat === "number") {
    if (bat < 60) {
      grade = drop(grade, 2);
      deductions.push({ label: `Battery health ${bat}%`, impact: "down 2 grades" });
    } else if (bat < 80) {
      grade = drop(grade, 1);
      deductions.push({ label: `Battery health ${bat}%`, impact: "down 1 grade" });
    }
  }

  if (grade === "reject") {
    return {
      grade,
      suggestedMaxBuy: 0,
      streetAsk: catalog.streetAsk,
      deductions,
      rejectReason: "Condition too weak for retail resale at a safe margin.",
    };
  }

  let suggested = Math.round((catalog.streetAsk * BUY_RATIO[grade]) / 100) * 100;
  if (typeof input.sellerAsking === "number" && input.sellerAsking > 0) {
    // Never suggest paying above what the seller is asking.
    suggested = Math.min(suggested, input.sellerAsking);
  }

  if (deductions.length === 0) {
    deductions.push({ label: "All checklist items clear", impact: "grade A baseline" });
  }

  return { grade, suggestedMaxBuy: suggested, streetAsk: catalog.streetAsk, deductions };
}

function labelFail(key: CheckKey): string {
  const map: Record<CheckKey, string> = {
    powersOn: "Won't power on",
    charges: "Charging / battery hold issue",
    display: "Display defect",
    touchOrKeyboard: "Touch / keyboard fault",
    cameras: "Camera fault",
    audio: "Audio fault",
    connectivity: "Radio / Wi-Fi fault",
    biometrics: "Biometrics fault",
    bodyCondition: "Heavy body damage",
    ports: "Port / button fault",
  };
  return map[key];
}

export function defaultChecks(): Record<CheckKey, CheckResult> {
  return {
    powersOn: "pass",
    charges: "pass",
    display: "pass",
    touchOrKeyboard: "pass",
    cameras: "pass",
    audio: "pass",
    connectivity: "pass",
    biometrics: "pass",
    bodyCondition: "pass",
    ports: "pass",
  };
}

export function defaultFlags(): Record<FlagKey, boolean> {
  return {
    waterDamage: false,
    replacedParts: false,
    accountLocked: false,
    stolenSuspect: false,
  };
}

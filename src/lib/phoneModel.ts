// Honest phone-model resolution for mobile visitors.
// - Input: the browser-reported device model captured in DeviceSnapshot.reportedModel
//   (only set when kind === "mobile", and only via navigator.userAgentData.getHighEntropyValues).
// - Match rule: EXACT model-code lookup against the generated Google Play catalog
//   (src/data/generated/androidPhoneModels.json). No fuzzy matching, no screen-dimension
//   inference of any kind — never reads width/height/aspect ratio/devicePixelRatio.
// - Unmapped, empty, missing, or ambiguous model => null. The UI then shows "Mobile device"
//   instead of pretending to know the phone.
import type { DeviceSnapshot } from "@/lib/deviceDetect";
import { deviceLabelFor } from "@/lib/deviceDetect";
import { lookupAndroidPhone, normalizeModelCode, type AndroidPhoneEntry } from "@/data/androidPhoneModels";

/** Exact, unambiguous resolution of a reported model code; null when unmapped/ambiguous. */
export function resolvePhoneModel(reportedModel?: string): AndroidPhoneEntry | null {
  return lookupAndroidPhone(normalizeModelCode(reportedModel ?? ""));
}

/**
 * Display label for the footer device row.
 * mobile  → marketing name when the model maps exactly and unambiguously, else "Mobile device".
 * tablet/pc → existing deviceLabelFor behavior, completely unchanged.
 */
export function getPhoneDisplayLabel(info: DeviceSnapshot): string {
  if (info.kind !== "mobile") return deviceLabelFor(info);
  const entry = resolvePhoneModel(info.reportedModel);
  return entry ? entry.marketingName : "Mobile device";
}

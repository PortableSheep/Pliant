import { RuleDef } from "../types";

export interface LengthOptions {
  min?: number;
  max?: number;
}

export const lengthRule = (defaults: LengthOptions = {}): RuleDef<LengthOptions> => ({
  options: {
    min: 0,
    max: 256,
    ...defaults
  },
  message: "Invalid length",
  validate: (value, _ctx, options) => {
    const length = typeof value === "string" || Array.isArray(value)
      ? value.length
      : value != null && typeof (value as { length?: number }).length === "number"
        ? (value as { length: number }).length
        : 0;

    if (options.min !== undefined && length < options.min) {
      return { code: "length", min: options.min, max: options.max, actual: length };
    }

    if (options.max !== undefined && length > options.max) {
      return { code: "length", min: options.min, max: options.max, actual: length };
    }

    return null;
  }
});

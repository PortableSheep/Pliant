import { RuleDef } from "../types";

export interface RangeOptions {
  min?: number;
  max?: number;
  inclusive?: boolean;
}

export const rangeRule = (defaults: RangeOptions = {}): RuleDef<RangeOptions> => ({
  options: {
    inclusive: true,
    ...defaults
  },
  message: "Out of range",
  validate: (value, _ctx, options) => {
    if (value === null || value === undefined || value === "") return null;

    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return { code: "range", min: options.min, max: options.max, actual: value };
    }

    const inclusive = options.inclusive ?? true;
    const belowMin = options.min !== undefined && (inclusive ? numeric < options.min : numeric <= options.min);
    const aboveMax = options.max !== undefined && (inclusive ? numeric > options.max : numeric >= options.max);

    if (belowMin || aboveMax) {
      return { code: "range", min: options.min, max: options.max, actual: numeric };
    }

    return null;
  }
});

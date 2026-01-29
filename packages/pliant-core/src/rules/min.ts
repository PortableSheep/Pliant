import { RuleDef } from "../types";

export interface MinOptions {
  min: number;
  inclusive?: boolean;
}

export const minRule = (defaults: MinOptions): RuleDef<MinOptions> => ({
  options: {
    inclusive: true,
    ...defaults
  },
  message: "Too low",
  validate: (value, _ctx, options) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return { code: "min", min: options.min, actual: value };
    }
    const inclusive = options.inclusive ?? true;
    const invalid = inclusive ? numeric < options.min : numeric <= options.min;
    return invalid ? { code: "min", min: options.min, actual: numeric } : null;
  }
});

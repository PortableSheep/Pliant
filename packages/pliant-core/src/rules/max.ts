import { RuleDef } from "../types";

export interface MaxOptions {
  max: number;
  inclusive?: boolean;
}

export const maxRule = (defaults: MaxOptions): RuleDef<MaxOptions> => ({
  options: {
    inclusive: true,
    ...defaults
  },
  message: "Too high",
  validate: (value, _ctx, options) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return { code: "max", max: options.max, actual: value };
    }
    const inclusive = options.inclusive ?? true;
    const invalid = inclusive ? numeric > options.max : numeric >= options.max;
    return invalid ? { code: "max", max: options.max, actual: numeric } : null;
  }
});

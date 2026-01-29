import { RuleDef } from "../types";

export interface RequiredOptions {
  trim?: boolean;
  allowFalse?: boolean;
  allowZero?: boolean;
}

export const requiredRule = (defaults: RequiredOptions = {}): RuleDef<RequiredOptions> => ({
  options: {
    trim: true,
    allowFalse: false,
    allowZero: true,
    ...defaults
  },
  message: "Required",
  validate: (value, _ctx, options) => {
    if (value === null || value === undefined) return { code: "required" };

    if (typeof value === "string") {
      const text = options.trim ? value.trim() : value;
      return text.length > 0 ? null : { code: "required" };
    }

    if (typeof value === "boolean") {
      return options.allowFalse ? null : value ? null : { code: "required" };
    }

    if (typeof value === "number") {
      return options.allowZero ? null : value !== 0 ? null : { code: "required" };
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? null : { code: "required" };
    }

    return null;
  }
});

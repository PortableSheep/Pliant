import { RuleDef } from "../types";

export interface EqualsOptions {
  field?: string;
  value?: unknown;
  strict?: boolean;
}

export const equalsRule = (defaults: EqualsOptions = {}): RuleDef<EqualsOptions> => ({
  options: {
    strict: true,
    ...defaults
  },
  message: "Must match",
  validate: (value, ctx, options) => {
    const expected = options.field && ctx.data ? (ctx.data as Record<string, unknown>)[options.field] : options.value;
    if (expected === undefined) return null;
    const valid = options.strict ? value === expected : value == expected;
    return valid ? null : { code: "equals", field: options.field, expected };
  }
});

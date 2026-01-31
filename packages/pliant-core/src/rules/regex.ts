import { RuleDef } from "../types";

export interface RegexOptions {
  pattern: RegExp;
}

export const regexRule = (defaults: RegexOptions): RuleDef<RegexOptions> => ({
  options: defaults,
  message: "Invalid format",
  validate: (value, _ctx, options) => {
    if (value === null || value === undefined || value === "") return null;
    return options.pattern.test(String(value)) ? null : { code: "regex" };
  }
});

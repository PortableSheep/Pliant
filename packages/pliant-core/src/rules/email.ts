import { RuleDef } from "../types";

export interface EmailOptions {
  pattern?: RegExp;
}

const defaultPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailRule = (defaults: EmailOptions = {}): RuleDef<EmailOptions> => ({
  options: {
    pattern: defaultPattern,
    ...defaults
  },
  message: "Invalid email",
  validate: (value, _ctx, options) => {
    if (value === null || value === undefined || value === "") return null;
    const pattern = options.pattern ?? defaultPattern;
    return pattern.test(String(value)) ? null : { code: "email" };
  }
});

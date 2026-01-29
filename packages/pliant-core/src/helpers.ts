import { RuleDef } from "./types";

export const inheritRule = <TOptions = unknown, TValue = unknown>(
  base: string,
  overrides: Omit<RuleDef<TOptions, TValue>, "inherit"> = {}
): RuleDef<TOptions, TValue> => ({
  inherit: base,
  ...overrides
});

import { inheritRule } from "../helpers";
import { RuleDef } from "../types";
import { LengthOptions } from "./length";

export interface MaxLengthOptions {
  max: number;
}

export const maxLengthRule = (defaults: MaxLengthOptions): RuleDef<LengthOptions> =>
  inheritRule<LengthOptions>("length", {
    options: {
      max: defaults.max
    },
    message: "Too long"
  });

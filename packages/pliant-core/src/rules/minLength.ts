import { inheritRule } from "../helpers";
import { RuleDef } from "../types";
import { LengthOptions } from "./length";

export interface MinLengthOptions {
  min: number;
}

export const minLengthRule = (defaults: MinLengthOptions): RuleDef<LengthOptions> =>
  inheritRule<LengthOptions>("length", {
    options: {
      min: defaults.min
    },
    message: "Too short"
  });

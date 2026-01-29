import { RuleDef } from "../types";
export interface RangeOptions {
    min?: number;
    max?: number;
    inclusive?: boolean;
}
export declare const rangeRule: (defaults?: RangeOptions) => RuleDef<RangeOptions>;
//# sourceMappingURL=range.d.ts.map
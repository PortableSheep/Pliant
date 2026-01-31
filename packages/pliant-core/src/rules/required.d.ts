import { RuleDef } from "../types";
export interface RequiredOptions {
    trim?: boolean;
    allowFalse?: boolean;
    allowZero?: boolean;
}
export declare const requiredRule: (defaults?: RequiredOptions) => RuleDef<RequiredOptions>;
//# sourceMappingURL=required.d.ts.map
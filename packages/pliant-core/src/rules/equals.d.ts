import { RuleDef } from "../types";
export interface EqualsOptions {
    field?: string;
    value?: unknown;
    strict?: boolean;
}
export declare const equalsRule: (defaults?: EqualsOptions) => RuleDef<EqualsOptions>;
//# sourceMappingURL=equals.d.ts.map
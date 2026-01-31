import { PliantErrorDetail, Registry, RuleContext, RuleRef, RuleResult } from "./types";
export declare const evaluateRule: (registry: Registry, value: unknown, ctx: RuleContext, ref: RuleRef) => RuleResult;
export declare const evaluateRules: (registry: Registry, value: unknown, ctx: RuleContext, rules: string | string[] | RuleRef | RuleRef[]) => Record<string, PliantErrorDetail> | null;
export declare const evaluateRulesAsync: (registry: Registry, value: unknown, ctx: RuleContext, rules: string | string[] | RuleRef | RuleRef[]) => Promise<Record<string, PliantErrorDetail> | null>;
//# sourceMappingURL=validate.d.ts.map
import { Registry, RuleContext, RuleRef } from "./types";
export interface Ruleset {
    fields?: Record<string, RuleRef[]>;
    group?: RuleRef[];
}
export interface RulesetErrors {
    group?: Record<string, unknown>;
    fields?: Record<string, Record<string, unknown>>;
}
export declare const evaluateRuleset: (registry: Registry, data: Record<string, unknown>, ruleset: Ruleset, ctx?: RuleContext) => RulesetErrors | null;
//# sourceMappingURL=ruleset.d.ts.map
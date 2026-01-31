import { MessageBuilder, Registry, ResolvedRuleDef, RuleDef, RuleRef } from "./types";
export declare const createRegistry: (initial?: Registry) => Registry;
export declare const addRules: (registry: Registry, rules: Registry) => void;
export type RuleOverrides = Partial<RuleDef>;
export declare const resolveRule: (registry: Registry, name: string, overrides?: RuleOverrides) => ResolvedRuleDef;
export declare const toRuleRef: (ref: RuleRef) => {
    name: string;
    options?: Record<string, unknown> | undefined;
    message?: string | MessageBuilder | undefined;
    enabled?: boolean | undefined;
};
export declare const resolveRuleRef: (registry: Registry, ref: RuleRef) => ResolvedRuleDef & {
    messageOverride?: string | MessageBuilder;
};
//# sourceMappingURL=registry.d.ts.map
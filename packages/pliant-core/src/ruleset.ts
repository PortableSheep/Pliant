import { Registry, RuleContext, RuleRef } from "./types";
import { evaluateRules } from "./validate";

export interface Ruleset {
  fields?: Record<string, RuleRef[]>;
  group?: RuleRef[];
}

export interface RulesetErrors {
  group?: Record<string, unknown>;
  fields?: Record<string, Record<string, unknown>>;
}

export const evaluateRuleset = (
  registry: Registry,
  data: Record<string, unknown>,
  ruleset: Ruleset,
  ctx?: RuleContext
): RulesetErrors | null => {
  const result: RulesetErrors = {};

  if (ruleset.group && ruleset.group.length > 0) {
    const groupCtx: RuleContext = { ...ctx, field: "$group", data };
    const groupErrors = evaluateRules(registry, data, groupCtx, ruleset.group);
    if (groupErrors) {
      result.group = groupErrors;
    }
  }

  if (ruleset.fields) {
    const fieldErrors: Record<string, Record<string, unknown>> = {};
    Object.keys(ruleset.fields).forEach((field) => {
      const rules = ruleset.fields?.[field] ?? [];
      if (rules.length === 0) return;
      const fieldCtx: RuleContext = { ...ctx, field, data };
      const errors = evaluateRules(registry, data[field], fieldCtx, rules);
      if (errors) {
        fieldErrors[field] = errors;
      }
    });
    if (Object.keys(fieldErrors).length > 0) {
      result.fields = fieldErrors;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
};

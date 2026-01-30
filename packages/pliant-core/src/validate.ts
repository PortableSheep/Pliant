import {
  MessageBuilder,
  PliantErrorDetail,
  Registry,
  RuleContext,
  RuleRef,
  RuleResult
} from "./types";
import { resolveRuleRef } from "./registry";

const applyMessage = (
  detail: PliantErrorDetail,
  ctx: RuleContext,
  message?: string | MessageBuilder
): PliantErrorDetail => {
  if (!message || detail.message) return detail;
  return {
    ...detail,
    message: typeof message === "function" ? message(detail, ctx) : message
  };
};

const createErrorDetail = (code: string, detail?: PliantErrorDetail): PliantErrorDetail => ({
  code,
  ...(detail ?? {})
});

export const evaluateRule = (
  registry: Registry,
  value: unknown,
  ctx: RuleContext,
  ref: RuleRef
): RuleResult => {
  const resolved = resolveRuleRef(registry, ref);

  if (resolved.enabled === false) return null;

  const result = resolved.validate(value, ctx, resolved.options ?? {});
  if (!result) return null;

  const detail = createErrorDetail(resolved.name, result);
  const message = resolved.messageOverride ?? resolved.message;
  return applyMessage(detail, ctx, message);
};

export const evaluateRules = (
  registry: Registry,
  value: unknown,
  ctx: RuleContext,
  rules: string | string[] | RuleRef | RuleRef[]
): Record<string, PliantErrorDetail> | null => {
  // Normalize to array
  const ruleArray = (Array.isArray(rules) ? rules : [rules]) as RuleRef[];
  
  const errors: Record<string, PliantErrorDetail> = {};

  // Short-circuit: stop at first error
  for (const ref of ruleArray) {
    const detail = evaluateRule(registry, value, ctx, ref);
    if (detail) {
      errors[detail.code] = detail;
      break; // Short-circuit on first error
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const evaluateRulesAsync = async (
  registry: Registry,
  value: unknown,
  ctx: RuleContext,
  rules: string | string[] | RuleRef | RuleRef[]
): Promise<Record<string, PliantErrorDetail> | null> => {
  // Normalize to array
  const ruleArray = (Array.isArray(rules) ? rules : [rules]) as RuleRef[];
  
  const errors: Record<string, PliantErrorDetail> = {};

  // Short-circuit: stop at first error
  for (const ref of ruleArray) {
    const resolved = resolveRuleRef(registry, ref);
    if (resolved.enabled === false) continue;

    if (resolved.validateAsync) {
      const result = await resolved.validateAsync(value, ctx, resolved.options ?? {});
      if (result) {
        const detail = createErrorDetail(resolved.name, result);
        const message = resolved.messageOverride ?? resolved.message;
        errors[detail.code] = applyMessage(detail, ctx, message);
        break; // Short-circuit on first error
      }
    } else {
      const result = resolved.validate(value, ctx, resolved.options ?? {});
      if (result) {
        const detail = createErrorDetail(resolved.name, result);
        const message = resolved.messageOverride ?? resolved.message;
        errors[detail.code] = applyMessage(detail, ctx, message);
        break; // Short-circuit on first error
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

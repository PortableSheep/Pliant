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
  rules: RuleRef[]
): Record<string, PliantErrorDetail> | null => {
  const errors: Record<string, PliantErrorDetail> = {};

  for (const ref of rules) {
    const detail = evaluateRule(registry, value, ctx, ref);
    if (detail) {
      errors[detail.code] = detail;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const evaluateRulesAsync = async (
  registry: Registry,
  value: unknown,
  ctx: RuleContext,
  rules: RuleRef[]
): Promise<Record<string, PliantErrorDetail> | null> => {
  const errors: Record<string, PliantErrorDetail> = {};

  for (const ref of rules) {
    const resolved = resolveRuleRef(registry, ref);
    if (resolved.enabled === false) continue;

    if (resolved.validateAsync) {
      const result = await resolved.validateAsync(value, ctx, resolved.options ?? {});
      if (result) {
        const detail = createErrorDetail(resolved.name, result);
        const message = resolved.messageOverride ?? resolved.message;
        errors[detail.code] = applyMessage(detail, ctx, message);
      }
    } else {
      const result = resolved.validate(value, ctx, resolved.options ?? {});
      if (result) {
        const detail = createErrorDetail(resolved.name, result);
        const message = resolved.messageOverride ?? resolved.message;
        errors[detail.code] = applyMessage(detail, ctx, message);
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

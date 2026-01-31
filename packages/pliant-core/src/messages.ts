import {
  MessageCatalog,
  MessageResolver,
  PliantErrorDetail,
  RuleContext
} from "./types";

export const createMessageResolver = (catalog: MessageCatalog): MessageResolver => {
  return (code, detail, ctx) => {
    const entry = catalog[code];
    if (!entry) return undefined;
    return typeof entry === "function" ? entry(detail, ctx) : entry;
  };
};

export const applyMessageResolver = (
  detail: PliantErrorDetail,
  ctx: RuleContext,
  resolver?: MessageResolver
): PliantErrorDetail => {
  if (detail.message || !resolver) return detail;
  const message = resolver(detail.code, detail, ctx);
  return message ? { ...detail, message } : detail;
};

export const applyMessages = (
  errors: Record<string, PliantErrorDetail> | null,
  ctx: RuleContext,
  resolver?: MessageResolver
): Record<string, PliantErrorDetail> | null => {
  if (!errors || !resolver) return errors;
  const withMessages: Record<string, PliantErrorDetail> = {};
  Object.keys(errors).forEach((key) => {
    withMessages[key] = applyMessageResolver(errors[key], ctx, resolver);
  });
  return withMessages;
};

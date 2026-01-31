import { inject } from "@angular/core";
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn
} from "@angular/forms";
import {
  applyMessages,
  createMessageResolver,
  createRegistry,
  evaluateRules,
  evaluateRulesAsync,
  MessageCatalog,
  MessageResolver,
  Registry,
  Ruleset,
  RuleContext,
  RuleRef
} from "@pliant/core";
import { PLIANT_MESSAGES, PLIANT_RULES } from "./providers";

const buildRegistry = (registries: Registry[] | null | undefined) => {
  const registry = createRegistry();
  (registries ?? []).forEach((entry) => {
    Object.assign(registry, entry);
  });
  return registry;
};

type MessageProvider = MessageResolver | MessageCatalog;

const toResolver = (provider: MessageProvider): MessageResolver => {
  return typeof provider === "function" ? provider : createMessageResolver(provider);
};

const buildMessageResolver = (
  providers: MessageProvider[] | null | undefined
): MessageResolver | undefined => {
  if (!providers || providers.length === 0) return undefined;
  const resolvers = providers.map(toResolver);
  return (code, detail, ctx) => {
    for (let i = resolvers.length - 1; i >= 0; i -= 1) {
      const message = resolvers[i](code, detail, ctx);
      if (message) return message;
    }
    return undefined;
  };
};

const createContext = (control: AbstractControl, field?: string): RuleContext => ({
  field,
  data: control.parent ? (control.parent.value as Record<string, unknown>) : undefined
});

export const pliant = (rules: RuleRef[], options?: { field?: string }): ValidatorFn => {
  const registries = inject(PLIANT_RULES, { optional: true });
  const registry = buildRegistry(registries);
  const messageProviders = inject(PLIANT_MESSAGES, { optional: true });
  const messageResolver = buildMessageResolver(messageProviders);

  return (control: AbstractControl): ValidationErrors | null => {
    const ctx = createContext(control, options?.field);
    const errors = evaluateRules(registry, control.value, ctx, rules);
    const resolved = applyMessages(errors, ctx, messageResolver);
    return resolved ? { pliant: resolved } : null;
  };
};

export const pliantAsync = (rules: RuleRef[], options?: { field?: string }): AsyncValidatorFn => {
  const registries = inject(PLIANT_RULES, { optional: true });
  const registry = buildRegistry(registries);
  const messageProviders = inject(PLIANT_MESSAGES, { optional: true });
  const messageResolver = buildMessageResolver(messageProviders);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const ctx = createContext(control, options?.field);
    const errors = await evaluateRulesAsync(registry, control.value, ctx, rules);
    const resolved = applyMessages(errors, ctx, messageResolver);
    return resolved ? { pliant: resolved } : null;
  };
};

export const pliantGroup = (ruleset: Ruleset): ValidatorFn => {
  const registries = inject(PLIANT_RULES, { optional: true });
  const registry = buildRegistry(registries);
  const messageProviders = inject(PLIANT_MESSAGES, { optional: true });
  const messageResolver = buildMessageResolver(messageProviders);

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value || typeof control.value !== "object") {
      return null;
    }

    const groupErrors: Record<string, unknown> = {};

    if (ruleset.group && ruleset.group.length > 0) {
      const ctx = createContext(control, "$group");
      const errors = evaluateRules(registry, control.value, ctx, ruleset.group);
      const resolved = applyMessages(errors, ctx, messageResolver);
      if (resolved) {
        groupErrors.group = resolved;
      }
    }

    if (ruleset.fields) {
      const fieldsErrors: Record<string, unknown> = {};
      Object.keys(ruleset.fields).forEach((field) => {
        const rules = ruleset.fields?.[field] ?? [];
        if (rules.length === 0) return;
        const ctx = createContext(control, field);
        const value = (control.value as Record<string, unknown>)[field];
        const errors = evaluateRules(registry, value, ctx, rules);
        const resolved = applyMessages(errors, ctx, messageResolver);
        if (resolved) {
          fieldsErrors[field] = resolved;
        }
      });
      if (Object.keys(fieldsErrors).length > 0) {
        groupErrors.fields = fieldsErrors;
      }
    }

    return Object.keys(groupErrors).length > 0 ? { pliant: groupErrors } : null;
  };
};

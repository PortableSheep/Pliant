import {
  MessageBuilder,
  Registry,
  ResolvedRuleDef,
  RuleDef,
  RuleRef
} from "./types";

const isDefined = (value: unknown) => value !== null && value !== undefined;

const mergeDefined = <T extends object>(base: T, extension: Partial<T>): T => {
  const merged: T = { ...base };
  (Object.keys(extension) as Array<keyof T>).forEach((key) => {
    const value = extension[key];
    if (isDefined(value)) {
      merged[key] = value as T[typeof key];
    }
  });
  return merged;
};

const mergeOptions = (
  base: Record<string, unknown> | undefined,
  extension: Record<string, unknown> | undefined
) => {
  if (!base && !extension) return undefined;
  return {
    ...(base ?? {}),
    ...(extension ?? {})
  };
};

export const createRegistry = (initial?: Registry): Registry => ({
  ...(initial ?? {})
});

export const addRules = (registry: Registry, rules: Registry): void => {
  Object.keys(rules).forEach((name) => {
    registry[name] = rules[name];
  });
};

export type RuleOverrides = Partial<RuleDef>;

export const resolveRule = (
  registry: Registry,
  name: string,
  overrides?: RuleOverrides
): ResolvedRuleDef => {
  const visited = new Set<string>();

  const resolveRecursive = (ruleName: string): RuleDef & { name: string } => {
    if (visited.has(ruleName)) {
      throw new Error(`Pliant: circular rule inheritance detected for "${ruleName}".`);
    }

    const base = registry[ruleName];
    if (!base) {
      throw new Error(`Pliant: rule "${ruleName}" is not registered.`);
    }

    visited.add(ruleName);

    let resolved: RuleDef & { name: string } = { ...base, name: ruleName };

    if (base.inherit) {
      const inherited = resolveRecursive(base.inherit);
      resolved = mergeDefined(inherited, resolved);
      resolved.options = mergeOptions(inherited.options as Record<string, unknown>, resolved.options as Record<string, unknown>);
    }

    return resolved;
  };

  let resolved = resolveRecursive(name);

  if (overrides) {
    resolved = mergeDefined(resolved, overrides as Partial<ResolvedRuleDef>);
    resolved.options = mergeOptions(
      resolved.options as Record<string, unknown>,
      overrides.options as Record<string, unknown>
    );
  }

  if (!resolved.validate) {
    throw new Error(`Pliant: rule "${name}" does not define a validate function.`);
  }

  return resolved as ResolvedRuleDef;
};

export const toRuleRef = (ref: RuleRef) => {
  if (typeof ref === "string") {
    return { name: ref };
  }

  if (Array.isArray(ref)) {
    return { name: ref[0], options: ref[1] };
  }

  return ref;
};

export const resolveRuleRef = (
  registry: Registry,
  ref: RuleRef
): ResolvedRuleDef & { messageOverride?: string | MessageBuilder } => {
  const { name, options, message, enabled } = toRuleRef(ref);
  const resolved = resolveRule(registry, name, {
    options,
    enabled
  });

  return {
    ...resolved,
    messageOverride: message
  };
};

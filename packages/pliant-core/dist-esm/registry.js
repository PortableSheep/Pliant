const isDefined = (value) => value !== null && value !== undefined;
const mergeDefined = (base, extension) => {
    const merged = { ...base };
    Object.keys(extension).forEach((key) => {
        const value = extension[key];
        if (isDefined(value)) {
            merged[key] = value;
        }
    });
    return merged;
};
const mergeOptions = (base, extension) => {
    if (!base && !extension)
        return undefined;
    return {
        ...(base !== null && base !== void 0 ? base : {}),
        ...(extension !== null && extension !== void 0 ? extension : {})
    };
};
export const createRegistry = (initial) => ({
    ...(initial !== null && initial !== void 0 ? initial : {})
});
export const addRules = (registry, rules) => {
    Object.keys(rules).forEach((name) => {
        registry[name] = rules[name];
    });
};
export const resolveRule = (registry, name, overrides) => {
    const visited = new Set();
    const resolveRecursive = (ruleName) => {
        if (visited.has(ruleName)) {
            throw new Error(`Pliant: circular rule inheritance detected for "${ruleName}".`);
        }
        const base = registry[ruleName];
        if (!base) {
            throw new Error(`Pliant: rule "${ruleName}" is not registered.`);
        }
        visited.add(ruleName);
        let resolved = { ...base, name: ruleName };
        if (base.inherit) {
            const inherited = resolveRecursive(base.inherit);
            resolved = mergeDefined(inherited, resolved);
            resolved.options = mergeOptions(inherited.options, resolved.options);
        }
        return resolved;
    };
    let resolved = resolveRecursive(name);
    if (overrides) {
        resolved = mergeDefined(resolved, overrides);
        resolved.options = mergeOptions(resolved.options, overrides.options);
    }
    if (!resolved.validate) {
        throw new Error(`Pliant: rule "${name}" does not define a validate function.`);
    }
    return resolved;
};
export const toRuleRef = (ref) => {
    if (typeof ref === "string") {
        return { name: ref };
    }
    if (Array.isArray(ref)) {
        return { name: ref[0], options: ref[1] };
    }
    return ref;
};
export const resolveRuleRef = (registry, ref) => {
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

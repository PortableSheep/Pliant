// dist-esm/registry.js
var isDefined = (value) => value !== null && value !== void 0;
var mergeDefined = (base, extension) => {
  const merged = { ...base };
  Object.keys(extension).forEach((key) => {
    const value = extension[key];
    if (isDefined(value)) {
      merged[key] = value;
    }
  });
  return merged;
};
var mergeOptions = (base, extension) => {
  if (!base && !extension)
    return void 0;
  return {
    ...base !== null && base !== void 0 ? base : {},
    ...extension !== null && extension !== void 0 ? extension : {}
  };
};
var createRegistry = (initial) => ({
  ...initial !== null && initial !== void 0 ? initial : {}
});
var addRules = (registry, rules) => {
  Object.keys(rules).forEach((name) => {
    registry[name] = rules[name];
  });
};
var resolveRule = (registry, name, overrides) => {
  const visited = /* @__PURE__ */ new Set();
  const resolveRecursive = (ruleName) => {
    if (visited.has(ruleName)) {
      throw new Error(`Pliant: circular rule inheritance detected for "${ruleName}".`);
    }
    const base = registry[ruleName];
    if (!base) {
      throw new Error(`Pliant: rule "${ruleName}" is not registered.`);
    }
    visited.add(ruleName);
    let resolved2 = { ...base, name: ruleName };
    if (base.inherit) {
      const inherited = resolveRecursive(base.inherit);
      resolved2 = mergeDefined(inherited, resolved2);
      resolved2.options = mergeOptions(inherited.options, resolved2.options);
    }
    return resolved2;
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
var toRuleRef = (ref) => {
  if (typeof ref === "string") {
    return { name: ref };
  }
  if (Array.isArray(ref)) {
    return { name: ref[0], options: ref[1] };
  }
  return ref;
};
var resolveRuleRef = (registry, ref) => {
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

// dist-esm/validate.js
var applyMessage = (detail, ctx, message) => {
  if (!message || detail.message)
    return detail;
  return {
    ...detail,
    message: typeof message === "function" ? message(detail, ctx) : message
  };
};
var createErrorDetail = (code, detail) => ({
  code,
  ...detail !== null && detail !== void 0 ? detail : {}
});
var evaluateRule = (registry, value, ctx, ref) => {
  var _a, _b;
  const resolved = resolveRuleRef(registry, ref);
  if (resolved.enabled === false)
    return null;
  const result = resolved.validate(value, ctx, (_a = resolved.options) !== null && _a !== void 0 ? _a : {});
  if (!result)
    return null;
  const detail = createErrorDetail(resolved.name, result);
  const message = (_b = resolved.messageOverride) !== null && _b !== void 0 ? _b : resolved.message;
  return applyMessage(detail, ctx, message);
};
var evaluateRules = (registry, value, ctx, rules) => {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  const errors = {};
  for (const ref of ruleArray) {
    const detail = evaluateRule(registry, value, ctx, ref);
    if (detail) {
      errors[detail.code] = detail;
      break;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
};
var evaluateRulesAsync = async (registry, value, ctx, rules) => {
  var _a, _b, _c, _d;
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  const errors = {};
  for (const ref of ruleArray) {
    const resolved = resolveRuleRef(registry, ref);
    if (resolved.enabled === false)
      continue;
    if (resolved.validateAsync) {
      const result = await resolved.validateAsync(value, ctx, (_a = resolved.options) !== null && _a !== void 0 ? _a : {});
      if (result) {
        const detail = createErrorDetail(resolved.name, result);
        const message = (_b = resolved.messageOverride) !== null && _b !== void 0 ? _b : resolved.message;
        errors[detail.code] = applyMessage(detail, ctx, message);
        break;
      }
    } else {
      const result = resolved.validate(value, ctx, (_c = resolved.options) !== null && _c !== void 0 ? _c : {});
      if (result) {
        const detail = createErrorDetail(resolved.name, result);
        const message = (_d = resolved.messageOverride) !== null && _d !== void 0 ? _d : resolved.message;
        errors[detail.code] = applyMessage(detail, ctx, message);
        break;
      }
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

// dist-esm/messages.js
var createMessageResolver = (catalog) => {
  return (code, detail, ctx) => {
    const entry = catalog[code];
    if (!entry)
      return void 0;
    return typeof entry === "function" ? entry(detail, ctx) : entry;
  };
};
var applyMessageResolver = (detail, ctx, resolver) => {
  if (detail.message || !resolver)
    return detail;
  const message = resolver(detail.code, detail, ctx);
  return message ? { ...detail, message } : detail;
};
var applyMessages = (errors, ctx, resolver) => {
  if (!errors || !resolver)
    return errors;
  const withMessages = {};
  Object.keys(errors).forEach((key) => {
    withMessages[key] = applyMessageResolver(errors[key], ctx, resolver);
  });
  return withMessages;
};

// dist-esm/helpers.js
var inheritRule = (base, overrides = {}) => ({
  inherit: base,
  ...overrides
});

// dist-esm/ruleset.js
var evaluateRuleset = (registry, data, ruleset, ctx) => {
  const result = {};
  if (ruleset.group && ruleset.group.length > 0) {
    const groupCtx = { ...ctx, field: "$group", data };
    const groupErrors = evaluateRules(registry, data, groupCtx, ruleset.group);
    if (groupErrors) {
      result.group = groupErrors;
    }
  }
  if (ruleset.fields) {
    const fieldErrors = {};
    Object.keys(ruleset.fields).forEach((field) => {
      var _a, _b;
      const rules = (_b = (_a = ruleset.fields) === null || _a === void 0 ? void 0 : _a[field]) !== null && _b !== void 0 ? _b : [];
      if (rules.length === 0)
        return;
      const fieldCtx = { ...ctx, field, data };
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

// dist-esm/rules/required.js
var requiredRule = (defaults = {}) => ({
  options: {
    trim: true,
    allowFalse: false,
    allowZero: true,
    ...defaults
  },
  message: "Required",
  validate: (value, _ctx, options) => {
    if (value === null || value === void 0)
      return { code: "required" };
    if (typeof value === "string") {
      const text = options.trim ? value.trim() : value;
      return text.length > 0 ? null : { code: "required" };
    }
    if (typeof value === "boolean") {
      return options.allowFalse ? null : value ? null : { code: "required" };
    }
    if (typeof value === "number") {
      return options.allowZero ? null : value !== 0 ? null : { code: "required" };
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? null : { code: "required" };
    }
    return null;
  }
});

// dist-esm/rules/length.js
var lengthRule = (defaults = {}) => ({
  options: {
    min: 0,
    max: 256,
    ...defaults
  },
  message: "Invalid length",
  validate: (value, _ctx, options) => {
    const length = typeof value === "string" || Array.isArray(value) ? value.length : value != null && typeof value.length === "number" ? value.length : 0;
    if (options.min !== void 0 && length < options.min) {
      return { code: "length", min: options.min, max: options.max, actual: length };
    }
    if (options.max !== void 0 && length > options.max) {
      return { code: "length", min: options.min, max: options.max, actual: length };
    }
    return null;
  }
});

// dist-esm/rules/numeric.js
var numericRule = () => ({
  message: "Numeric only",
  validate: (value) => {
    if (value === null || value === void 0 || value === "")
      return null;
    return /^\d+$/i.test(String(value)) ? null : { code: "numeric" };
  }
});

// dist-esm/rules/regex.js
var regexRule = (defaults) => ({
  options: defaults,
  message: "Invalid format",
  validate: (value, _ctx, options) => {
    if (value === null || value === void 0 || value === "")
      return null;
    return options.pattern.test(String(value)) ? null : { code: "regex" };
  }
});

// dist-esm/rules/email.js
var defaultPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var emailRule = (defaults = {}) => ({
  options: {
    pattern: defaultPattern,
    ...defaults
  },
  message: "Invalid email",
  validate: (value, _ctx, options) => {
    var _a;
    if (value === null || value === void 0 || value === "")
      return null;
    const pattern = (_a = options.pattern) !== null && _a !== void 0 ? _a : defaultPattern;
    return pattern.test(String(value)) ? null : { code: "email" };
  }
});

// dist-esm/rules/range.js
var rangeRule = (defaults = {}) => ({
  options: {
    inclusive: true,
    ...defaults
  },
  message: "Out of range",
  validate: (value, _ctx, options) => {
    var _a;
    if (value === null || value === void 0 || value === "")
      return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return { code: "range", min: options.min, max: options.max, actual: value };
    }
    const inclusive = (_a = options.inclusive) !== null && _a !== void 0 ? _a : true;
    const belowMin = options.min !== void 0 && (inclusive ? numeric < options.min : numeric <= options.min);
    const aboveMax = options.max !== void 0 && (inclusive ? numeric > options.max : numeric >= options.max);
    if (belowMin || aboveMax) {
      return { code: "range", min: options.min, max: options.max, actual: numeric };
    }
    return null;
  }
});

// dist-esm/rules/min.js
var minRule = (defaults) => ({
  options: {
    inclusive: true,
    ...defaults
  },
  message: "Too low",
  validate: (value, _ctx, options) => {
    var _a;
    if (value === null || value === void 0 || value === "")
      return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return { code: "min", min: options.min, actual: value };
    }
    const inclusive = (_a = options.inclusive) !== null && _a !== void 0 ? _a : true;
    const invalid = inclusive ? numeric < options.min : numeric <= options.min;
    return invalid ? { code: "min", min: options.min, actual: numeric } : null;
  }
});

// dist-esm/rules/max.js
var maxRule = (defaults) => ({
  options: {
    inclusive: true,
    ...defaults
  },
  message: "Too high",
  validate: (value, _ctx, options) => {
    var _a;
    if (value === null || value === void 0 || value === "")
      return null;
    const numeric = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numeric)) {
      return { code: "max", max: options.max, actual: value };
    }
    const inclusive = (_a = options.inclusive) !== null && _a !== void 0 ? _a : true;
    const invalid = inclusive ? numeric > options.max : numeric >= options.max;
    return invalid ? { code: "max", max: options.max, actual: numeric } : null;
  }
});

// dist-esm/rules/minLength.js
var minLengthRule = (defaults) => inheritRule("length", {
  options: {
    min: defaults.min
  },
  message: "Too short"
});

// dist-esm/rules/maxLength.js
var maxLengthRule = (defaults) => inheritRule("length", {
  options: {
    max: defaults.max
  },
  message: "Too long"
});

// dist-esm/rules/equals.js
var equalsRule = (defaults = {}) => ({
  options: {
    strict: true,
    ...defaults
  },
  message: "Must match",
  validate: (value, ctx, options) => {
    const expected = options.field && ctx.data ? ctx.data[options.field] : options.value;
    if (expected === void 0)
      return null;
    const valid = options.strict ? value === expected : value == expected;
    return valid ? null : { code: "equals", field: options.field, expected };
  }
});
export {
  addRules,
  applyMessageResolver,
  applyMessages,
  createMessageResolver,
  createRegistry,
  emailRule,
  equalsRule,
  evaluateRule,
  evaluateRules,
  evaluateRulesAsync,
  evaluateRuleset,
  inheritRule,
  lengthRule,
  maxLengthRule,
  maxRule,
  minLengthRule,
  minRule,
  numericRule,
  rangeRule,
  regexRule,
  requiredRule,
  resolveRule,
  resolveRuleRef,
  toRuleRef
};

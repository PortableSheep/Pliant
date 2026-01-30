import { resolveRuleRef } from "./registry";
const applyMessage = (detail, ctx, message) => {
    if (!message || detail.message)
        return detail;
    return {
        ...detail,
        message: typeof message === "function" ? message(detail, ctx) : message
    };
};
const createErrorDetail = (code, detail) => ({
    code,
    ...(detail !== null && detail !== void 0 ? detail : {})
});
export const evaluateRule = (registry, value, ctx, ref) => {
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
export const evaluateRules = (registry, value, ctx, rules) => {
    // Normalize to array
    const ruleArray = (Array.isArray(rules) ? rules : [rules]);
    const errors = {};
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
export const evaluateRulesAsync = async (registry, value, ctx, rules) => {
    var _a, _b, _c, _d;
    // Normalize to array
    const ruleArray = (Array.isArray(rules) ? rules : [rules]);
    const errors = {};
    // Short-circuit: stop at first error
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
                break; // Short-circuit on first error
            }
        }
        else {
            const result = resolved.validate(value, ctx, (_c = resolved.options) !== null && _c !== void 0 ? _c : {});
            if (result) {
                const detail = createErrorDetail(resolved.name, result);
                const message = (_d = resolved.messageOverride) !== null && _d !== void 0 ? _d : resolved.message;
                errors[detail.code] = applyMessage(detail, ctx, message);
                break; // Short-circuit on first error
            }
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
};

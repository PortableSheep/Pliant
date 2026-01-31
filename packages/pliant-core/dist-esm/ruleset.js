import { evaluateRules } from "./validate";
export const evaluateRuleset = (registry, data, ruleset, ctx) => {
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

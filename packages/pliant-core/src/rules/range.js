export const rangeRule = (defaults = {}) => ({
    options: {
        inclusive: true,
        ...defaults
    },
    message: "Out of range",
    validate: (value, _ctx, options) => {
        var _a;
        if (value === null || value === undefined || value === "")
            return null;
        const numeric = typeof value === "number" ? value : Number(value);
        if (Number.isNaN(numeric)) {
            return { code: "range", min: options.min, max: options.max, actual: value };
        }
        const inclusive = (_a = options.inclusive) !== null && _a !== void 0 ? _a : true;
        const belowMin = options.min !== undefined && (inclusive ? numeric < options.min : numeric <= options.min);
        const aboveMax = options.max !== undefined && (inclusive ? numeric > options.max : numeric >= options.max);
        if (belowMin || aboveMax) {
            return { code: "range", min: options.min, max: options.max, actual: numeric };
        }
        return null;
    }
});

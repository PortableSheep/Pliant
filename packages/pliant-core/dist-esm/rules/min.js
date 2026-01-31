export const minRule = (defaults) => ({
    options: {
        inclusive: true,
        ...defaults
    },
    message: "Too low",
    validate: (value, _ctx, options) => {
        var _a;
        if (value === null || value === undefined || value === "")
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

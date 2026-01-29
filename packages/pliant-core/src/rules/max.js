export const maxRule = (defaults) => ({
    options: {
        inclusive: true,
        ...defaults
    },
    message: "Too high",
    validate: (value, _ctx, options) => {
        var _a;
        if (value === null || value === undefined || value === "")
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

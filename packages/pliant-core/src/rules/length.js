export const lengthRule = (defaults = {}) => ({
    options: {
        min: 0,
        max: 256,
        ...defaults
    },
    message: "Invalid length",
    validate: (value, _ctx, options) => {
        const length = typeof value === "string" || Array.isArray(value)
            ? value.length
            : value != null && typeof value.length === "number"
                ? value.length
                : 0;
        if (options.min !== undefined && length < options.min) {
            return { code: "length", min: options.min, max: options.max, actual: length };
        }
        if (options.max !== undefined && length > options.max) {
            return { code: "length", min: options.min, max: options.max, actual: length };
        }
        return null;
    }
});

export const equalsRule = (defaults = {}) => ({
    options: {
        strict: true,
        ...defaults
    },
    message: "Must match",
    validate: (value, ctx, options) => {
        const expected = options.field && ctx.data ? ctx.data[options.field] : options.value;
        if (expected === undefined)
            return null;
        const valid = options.strict ? value === expected : value == expected;
        return valid ? null : { code: "equals", field: options.field, expected };
    }
});

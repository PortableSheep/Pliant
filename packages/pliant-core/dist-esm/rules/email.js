const defaultPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const emailRule = (defaults = {}) => ({
    options: {
        pattern: defaultPattern,
        ...defaults
    },
    message: "Invalid email",
    validate: (value, _ctx, options) => {
        var _a;
        if (value === null || value === undefined || value === "")
            return null;
        const pattern = (_a = options.pattern) !== null && _a !== void 0 ? _a : defaultPattern;
        return pattern.test(String(value)) ? null : { code: "email" };
    }
});

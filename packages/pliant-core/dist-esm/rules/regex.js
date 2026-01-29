export const regexRule = (defaults) => ({
    options: defaults,
    message: "Invalid format",
    validate: (value, _ctx, options) => {
        if (value === null || value === undefined || value === "")
            return null;
        return options.pattern.test(String(value)) ? null : { code: "regex" };
    }
});

export const createMessageResolver = (catalog) => {
    return (code, detail, ctx) => {
        const entry = catalog[code];
        if (!entry)
            return undefined;
        return typeof entry === "function" ? entry(detail, ctx) : entry;
    };
};
export const applyMessageResolver = (detail, ctx, resolver) => {
    if (detail.message || !resolver)
        return detail;
    const message = resolver(detail.code, detail, ctx);
    return message ? { ...detail, message } : detail;
};
export const applyMessages = (errors, ctx, resolver) => {
    if (!errors || !resolver)
        return errors;
    const withMessages = {};
    Object.keys(errors).forEach((key) => {
        withMessages[key] = applyMessageResolver(errors[key], ctx, resolver);
    });
    return withMessages;
};

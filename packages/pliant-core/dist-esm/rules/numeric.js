export const numericRule = () => ({
    message: "Numeric only",
    validate: (value) => {
        if (value === null || value === undefined || value === "")
            return null;
        return /^\d+$/i.test(String(value)) ? null : { code: "numeric" };
    }
});

export const inheritRule = (base, overrides = {}) => ({
    inherit: base,
    ...overrides
});

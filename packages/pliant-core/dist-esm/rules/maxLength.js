import { inheritRule } from "../helpers";
export const maxLengthRule = (defaults) => inheritRule("length", {
    options: {
        max: defaults.max
    },
    message: "Too long"
});

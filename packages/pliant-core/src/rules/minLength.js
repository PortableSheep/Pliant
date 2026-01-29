import { inheritRule } from "../helpers";
export const minLengthRule = (defaults) => inheritRule("length", {
    options: {
        min: defaults.min
    },
    message: "Too short"
});

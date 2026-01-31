import { bootstrapApplication } from "@angular/platform-browser";
import { providePliantMessages, providePliantRules } from "@pliant/angular";
import {
  equalsRule,
  inheritRule,
  lengthRule,
  requiredRule,
  emailRule,
  rangeRule,
  minRule,
  maxRule,
  numericRule,
  regexRule,
  minLengthRule,
  maxLengthRule
} from "@pliant/core";
import { AppComponent } from "./app.component";

bootstrapApplication(AppComponent, {
  providers: [
    providePliantRules({
      // Base rules
      required: requiredRule(),
      email: emailRule(),
      numeric: numericRule(),
      length: lengthRule({ min: 0, max: 256 }), // Base rule for minLength/maxLength

      // Length rules (inherit from length)
      usernameLength: lengthRule({ min: 3, max: 20 }),
      bioLength: maxLengthRule({ max: 100 }),
      passwordLength: minLengthRule({ min: 8 }),

      // Range/numeric rules
      ageRange: rangeRule({ min: 18, max: 120, inclusive: true }),
      scoreMin: minRule({ min: 0, inclusive: true }),
      discountMax: maxRule({ max: 100, inclusive: true }),

      // Pattern rule
      slugPattern: regexRule({ pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ }),

      // Cross-field rule
      equals: equalsRule()
    }),
    providePliantMessages({
      required: "This field is required",
      email: "Please enter a valid email address",
      numeric: "Only numeric digits allowed",
      length: (detail: any) => {
        if (detail.actual < detail.min) {
          return `Must be at least ${detail.min} characters (currently ${detail.actual})`;
        }
        return `Must be no more than ${detail.max} characters (currently ${detail.actual})`;
      },
      minLength: (detail: any) => `Must be at least ${detail.min} characters`,
      maxLength: (detail: any) => `Must be no more than ${detail.max} characters (currently ${detail.actual})`,
      range: (detail: any) => `Must be between ${detail.min} and ${detail.max}`,
      min: (detail: any) => `Must be at least ${detail.min}`,
      max: (detail: any) => `Must be no more than ${detail.max}`,
      regex: "Invalid format (use lowercase letters, numbers, and hyphens)",
      equals: "Passwords must match"
    })
  ]
});

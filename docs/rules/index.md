# Built-in Rules

@pliant/core includes 11 production-ready rules that cover common validation scenarios. All rules are tree-shakeable—only the rules you import are included in your bundle.

## Rule List

| Rule | Description | Common Use |
|------|-------------|------------|
| [required](/rules/required) | Value must be present | Required fields |
| [email](/rules/email) | Valid email format | Email inputs |
| [numeric](/rules/numeric) | Numeric characters only | ID numbers |
| [length](/rules/length) | Length within range | Usernames, passwords |
| [minLength](/rules/minLength) | Minimum length | Passwords |
| [maxLength](/rules/maxLength) | Maximum length | Comments, bios |
| [range](/rules/range) | Number within range | Age, quantity |
| [min](/rules/min) | Minimum value | Prices |
| [max](/rules/max) | Maximum value | Limits |
| [regex](/rules/regex) | Pattern matching | Phone, postal code |
| [equals](/rules/equals) | Value equality | Password confirm |

## Quick Reference

```ts
import {
  requiredRule,    // required()
  emailRule,       // email({ allowEmpty? })
  numericRule,     // numeric()
  lengthRule,      // length({ min?, max? })
  minLengthRule,   // minLength({ min })
  maxLengthRule,   // maxLength({ max })
  rangeRule,       // range({ min, max })
  minRule,         // min({ min })
  maxRule,         // max({ max })
  regexRule,       // regex({ pattern, invert? })
  equalsRule       // equals({ field?, value? })
} from '@pliant/core';
```

## Usage Pattern

All rules follow the same pattern:

```ts
import { createRegistry, addRules, ruleNameRule } from '@pliant/core';

const registry = createRegistry();

addRules(registry, {
  ruleName: ruleNameRule(options)
});
```

## Complete Example

```ts
import {
  createRegistry,
  addRules,
  evaluateRules,
  requiredRule,
  emailRule,
  lengthRule,
  minLengthRule,
  rangeRule,
  regexRule,
  equalsRule
} from '@pliant/core';

const registry = createRegistry();

addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  username: lengthRule({ min: 3, max: 20 }),
  password: minLengthRule({ min: 8 }),
  age: rangeRule({ min: 18, max: 120 }),
  phone: regexRule({ pattern: /^\d{10}$/ }),
  confirmPassword: equalsRule({ field: 'password' })
});
```

## Inheritance

All rules can be extended with `inheritRule()`:

```ts
import { inheritRule, minLengthRule } from '@pliant/core';

const strongPassword = inheritRule(minLengthRule({ min: 12 }), {
  code: 'strongPassword'
});
```

See [Rule Inheritance](/guide/rule-inheritance) for details.

## Custom Rules

Need something specific? See [Custom Rules](/rules/custom).

## Async Rules

For server-side validation, see [Async Rules](/rules/async).

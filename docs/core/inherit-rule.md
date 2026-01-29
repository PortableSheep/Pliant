# inheritRule()

Creates a new rule that inherits behavior from an existing rule, with optional overrides. This is useful for creating specialized variants of built-in rules.

## Signature

```ts
function inheritRule<TData>(
  parent: RuleDef<TData>,
  overrides: Partial<RuleDef<TData>>
): RuleDef<TData>
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `parent` | `RuleDef<TData>` | The rule to inherit from |
| `overrides` | `Partial<RuleDef<TData>>` | Properties to override |

## Returns

`RuleDef<TData>` — A new rule definition that inherits from the parent.

## Example

```ts
import { inheritRule, lengthRule, addRules, createRegistry } from '@pliant/core';

const registry = createRegistry();

// Create specialized length rules
const usernameLength = inheritRule(lengthRule({ min: 3, max: 20 }), {
  code: 'usernameLength'
});

const passwordLength = inheritRule(lengthRule({ min: 8, max: 128 }), {
  code: 'passwordLength'
});

addRules(registry, {
  usernameLength,
  passwordLength
});
```

## What Can Be Overridden

### Custom Error Code

The most common use - provide a unique code for distinct messages:

```ts
const shortUsername = inheritRule(minLengthRule({ min: 3 }), {
  code: 'shortUsername'  // Custom code instead of 'minLength'
});

// Validation error:
// { shortUsername: { code: 'shortUsername', min: 3, actual: 2 } }
```

### Custom Validation Logic

Add additional validation on top of the parent:

```ts
const strongPassword = inheritRule(lengthRule({ min: 8, max: 100 }), {
  code: 'strongPassword',
  validate(value, ctx) {
    // First run parent validation
    const parentResult = this.parent?.validate?.(value, ctx);
    if (parentResult) return parentResult;
    
    // Then add custom checks
    if (!/[A-Z]/.test(String(value))) {
      return { code: 'strongPassword', reason: 'uppercase' };
    }
    if (!/[0-9]/.test(String(value))) {
      return { code: 'strongPassword', reason: 'digit' };
    }
    
    return null;
  }
});
```

### Different Defaults

Create presets with different default values:

```ts
// Strict email: no empty values allowed
const strictEmail = inheritRule(emailRule({ allowEmpty: false }), {
  code: 'emailRequired'
});

// Lenient email: empty is okay
const optionalEmail = inheritRule(emailRule({ allowEmpty: true }), {
  code: 'emailOptional'
});
```

## Inheritance Chain

You can inherit from inherited rules:

```ts
// Base: length 1-100
const baseLength = lengthRule({ min: 1, max: 100 });

// Level 1: username constraints
const usernameBase = inheritRule(baseLength, {
  code: 'usernameLength'
});

// Level 2: stricter username
const strictUsername = inheritRule(usernameBase, {
  code: 'strictUsername',
  // Override to be more restrictive
  validate(value, ctx) {
    const str = String(value ?? '');
    if (str.length < 5 || str.length > 15) {
      return { code: 'strictUsername', min: 5, max: 15, actual: str.length };
    }
    return null;
  }
});
```

## Message Resolution

Inherited rules with custom codes need their own messages:

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  // Base rules
  minLength: (d) => `At least ${d.min} characters`,
  maxLength: (d) => `At most ${d.max} characters`,
  
  // Inherited rule custom messages
  usernameLength: (d) => `Username must be ${d.min}-${d.max} characters`,
  passwordLength: (d) => `Password must be at least ${d.min} characters`,
  strongPassword: (d) => {
    if (d.reason === 'uppercase') return 'Must include an uppercase letter';
    if (d.reason === 'digit') return 'Must include a number';
    return 'Password too weak';
  }
});
```

## Real-World Example

```ts
import {
  createRegistry,
  addRules,
  inheritRule,
  requiredRule,
  emailRule,
  minLengthRule,
  lengthRule,
  regexRule
} from '@pliant/core';

const registry = createRegistry();

addRules(registry, {
  // Base rules
  required: requiredRule(),
  email: emailRule(),
  
  // User fields
  username: inheritRule(lengthRule({ min: 3, max: 20 }), {
    code: 'username'
  }),
  
  // Password with requirements
  password: inheritRule(minLengthRule({ min: 8 }), {
    code: 'password'
  }),
  
  // Phone number
  phone: inheritRule(regexRule({ pattern: /^\d{10}$/ }), {
    code: 'phone'
  }),
  
  // Postal codes by country
  usZip: inheritRule(regexRule({ pattern: /^\d{5}(-\d{4})?$/ }), {
    code: 'usZip'
  }),
  canadaPostal: inheritRule(regexRule({ pattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i }), {
    code: 'canadaPostal'
  })
});
```

## See Also

- [Rule Inheritance Guide](/guide/rule-inheritance) — Conceptual overview
- [addRules()](/core/add-rules) — Register rules
- [Built-in Rules](/rules/) — Rules to inherit from

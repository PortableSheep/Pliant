# addRules()

Adds one or more rules to a registry. Rules must be added before they can be used in validation.

## Signature

```ts
function addRules<TData>(
  registry: Registry<TData>,
  rules: Record<string, RuleDef<TData>>
): void
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `registry` | `Registry<TData>` | The registry to add rules to |
| `rules` | `Record<string, RuleDef<TData>>` | Object mapping rule names to definitions |

## Returns

`void` — Rules are added in place.

## Example

```ts
import { 
  createRegistry, 
  addRules, 
  requiredRule, 
  emailRule 
} from '@pliant/core';

const registry = createRegistry();

addRules(registry, {
  required: requiredRule(),
  email: emailRule()
});
```

## Multiple Calls

You can call `addRules()` multiple times:

```ts
// Add base rules
addRules(registry, {
  required: requiredRule(),
  email: emailRule()
});

// Add more rules later
addRules(registry, {
  username: minLengthRule({ min: 3 }),
  password: lengthRule({ min: 8, max: 100 })
});
```

## Overwriting Rules

Adding a rule with an existing name replaces it:

```ts
addRules(registry, {
  email: emailRule()
});

// This replaces the previous email rule
addRules(registry, {
  email: emailRule({ allowEmpty: false })
});
```

## Custom Rules

You can add custom rule definitions:

```ts
import type { RuleDef } from '@pliant/core';

const positiveNumber: RuleDef = {
  validate(value) {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return { code: 'positive', value };
    }
    return null;
  }
};

addRules(registry, {
  required: requiredRule(),
  positive: positiveNumber
});
```

## Inherited Rules

Use `inheritRule()` to create variants:

```ts
import { inheritRule, requiredRule, lengthRule } from '@pliant/core';

addRules(registry, {
  // Base rules
  required: requiredRule(),
  length: lengthRule({ min: 1, max: 100 }),
  
  // Inherited variants
  usernameLength: inheritRule(lengthRule({ min: 3, max: 20 }), {
    code: 'usernameLength'
  }),
  passwordLength: inheritRule(lengthRule({ min: 8, max: 128 }), {
    code: 'passwordLength'
  })
});
```

## See Also

- [createRegistry()](/core/create-registry) — Create a registry
- [evaluateRules()](/core/evaluate-rules) — Validate using rules
- [inheritRule()](/core/inherit-rule) — Create inherited rules

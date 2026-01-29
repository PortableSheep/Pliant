# Why Pliant?

## The Problem with Traditional Validation

Most validation libraries return simple strings or booleans:

```ts
// Traditional approach
const isValid = validator.isEmail(value);
const message = isValid ? null : 'Invalid email';
```

This creates several issues:

1. **Messages are hardcoded** - No context for i18n or dynamic messages
2. **No structured data** - Can't programmatically handle different error types
3. **Framework coupling** - Validation logic is often tied to form libraries
4. **Poor composability** - Hard to build complex rules from simple ones

## The Pliant Approach

### Errors as Data

Pliant returns structured error objects:

```ts
{
  code: 'length',
  min: 3,
  max: 20,
  actual: 2
}
```

This gives you:
- **Error codes** for i18n lookup
- **Contextual data** for dynamic messages
- **Type safety** with TypeScript
- **Programmatic handling** of different error types

### Separation of Concerns

Pliant separates validation logic from message resolution:

```ts
// 1. Define rules (logic)
const rules = {
  password: lengthRule({ min: 8, max: 64 })
};

// 2. Define messages (presentation)
const messages = {
  length: (d) => `Must be ${d.min}-${d.max} characters`
};

// 3. Validate and apply messages separately
const errors = evaluateRules(registry, value, ctx, ['password']);
const resolved = applyMessages(errors, ctx, messages);
```

### Framework Independence

The core package has zero dependencies and works anywhere:

```ts
// Node.js
import { evaluateRules } from '@pliant/core';

// Browser (ESM)
import { evaluateRules } from '@pliant/core';

// Any framework
const errors = evaluateRules(registry, value, ctx, rules);
```

Framework adapters (like `@pliant/angular`) provide idiomatic integrations while using the same core logic.

### Rule Inheritance

Create specialized rules without duplicating logic:

```ts
// Base rule
addRules(registry, {
  length: lengthRule({ min: 0, max: 256 })
});

// Specialized rules inherit from base
addRules(registry, {
  username: inheritRule('length', { 
    options: { min: 3, max: 20 } 
  }),
  bio: inheritRule('length', { 
    options: { max: 500 } 
  }),
  tweet: inheritRule('length', { 
    options: { max: 280 },
    message: 'Tweet too long!'
  })
});
```

## Comparison

| Feature | Pliant | Yup | Zod | class-validator |
|---------|--------|-----|-----|-----------------|
| Structured errors | ✅ | ❌ | ✅ | ❌ |
| Rule inheritance | ✅ | ❌ | ❌ | ❌ |
| Framework agnostic | ✅ | ✅ | ✅ | ❌ |
| Separate messages | ✅ | ❌ | ❌ | ❌ |
| Angular adapter | ✅ | ❌ | ❌ | ✅ |
| Zero dependencies | ✅ | ❌ | ✅ | ❌ |

## When to Use Pliant

Pliant is ideal when you need:

- **i18n support** - Error codes make translation easy
- **Custom error handling** - Structured data for complex UIs
- **Code reuse** - Inheritance creates rule families
- **Framework flexibility** - Same rules across projects
- **TypeScript** - Full type inference for rules and errors

## When Not to Use Pliant

Consider alternatives if you need:

- **Schema-based validation** - Zod or Yup may be better for parsing
- **Decorator-based validation** - class-validator for class validation
- **Built-in form integration** - Some frameworks have native solutions

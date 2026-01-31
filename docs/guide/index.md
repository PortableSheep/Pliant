# What is Pliant?

Pliant is a modern, framework-agnostic validation library designed for TypeScript and JavaScript applications. It provides a clean, composable approach to validation with structured error objects, rule inheritance, and flexible message resolution.

## Key Features

### 🎯 Framework Agnostic Core

The `@pliant/core` package works anywhere JavaScript runs:

```ts
import { createRegistry, addRules, evaluateRules, requiredRule, emailRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  required: requiredRule(),
  email: emailRule()
});

const errors = evaluateRules(registry, 'invalid', {}, ['email']);
// { email: { code: 'email' } }
```

### 📦 Structured Errors

Every validation error is a typed object with contextual information:

```ts
{
  code: 'length',
  min: 3,
  max: 20,
  actual: 2,
  message: 'Must be 3-20 characters'
}
```

### 🔗 Rule Inheritance

Create specialized rules that extend existing ones:

```ts
import { inheritRule, lengthRule } from '@pliant/core';

addRules(registry, {
  length: lengthRule({ min: 0, max: 256 }),
  usernameLength: inheritRule('length', {
    options: { min: 3, max: 20 },
    message: 'Username must be 3-20 characters'
  })
});
```

### ⚡ Angular Integration

First-class Angular support with DI providers:

```ts
import { providePliantRules, pliant } from '@pliant/angular';

// In your app config
providers: [
  providePliantRules({
    required: requiredRule(),
    email: emailRule()
  })
]

// In your component
form = new FormGroup({
  email: new FormControl('', { validators: [pliant(['required', 'email'])] })
});
```

## Packages

| Package | Description |
|---------|-------------|
| `@pliant/core` | Core validation engine, rules, and utilities |
| `@pliant/angular` | Angular integration with DI providers and ValidatorFn adapters |

## Philosophy

Pliant is built on these principles:

1. **Errors are data** - Validation errors should be structured objects, not just strings
2. **Rules are composable** - Build complex validation from simple, reusable rules
3. **Framework independence** - Core logic shouldn't be tied to any framework
4. **TypeScript first** - Full type safety for rules, options, and errors
5. **Simple API** - Easy to learn, easy to use, easy to extend

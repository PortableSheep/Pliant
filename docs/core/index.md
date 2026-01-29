# @pliant/core

The core package provides the validation engine, built-in rules, and utilities. It has zero dependencies and works in any JavaScript environment.

## Installation

```sh
npm install @pliant/core
```

## Exports

### Registry Functions

| Export | Description |
|--------|-------------|
| `createRegistry()` | Create a new rule registry |
| `addRules(registry, rules)` | Add rules to a registry |
| `evaluateRules(registry, value, ctx, rules)` | Validate a value |

### Rule Factories

| Export | Description |
|--------|-------------|
| `requiredRule(options?)` | Creates a required rule |
| `emailRule(options?)` | Creates an email rule |
| `numericRule()` | Creates a numeric-only rule |
| `lengthRule(options)` | Creates a length rule |
| `minLengthRule(options)` | Creates a min length rule |
| `maxLengthRule(options)` | Creates a max length rule |
| `rangeRule(options)` | Creates a numeric range rule |
| `minRule(options)` | Creates a minimum value rule |
| `maxRule(options)` | Creates a maximum value rule |
| `regexRule(options)` | Creates a regex pattern rule |
| `equalsRule(options?)` | Creates an equality rule |

### Helpers

| Export | Description |
|--------|-------------|
| `inheritRule(parent, overrides)` | Create a rule inheriting from another |
| `createMessageResolver(catalog)` | Create a message resolver |
| `applyMessages(errors, ctx, resolver)` | Apply messages to errors |

## Quick Example

```ts
import {
  createRegistry,
  addRules,
  evaluateRules,
  applyMessages,
  createMessageResolver,
  requiredRule,
  emailRule,
  lengthRule
} from '@pliant/core';

// Setup
const registry = createRegistry();
addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  username: lengthRule({ min: 3, max: 20 })
});

const messages = createMessageResolver({
  required: 'Required',
  email: 'Invalid email',
  length: (d) => `Must be ${d.min}-${d.max} chars`
});

// Validate
const errors = evaluateRules(registry, 'ab', { field: 'username' }, ['username']);
const resolved = applyMessages(errors, {}, messages);
// { username: { code: 'length', min: 3, max: 20, actual: 2, message: 'Must be 3-20 chars' } }
```

## TypeScript Support

Full TypeScript support with generic types:

```ts
import type { RuleDef, ErrorDetail, Context, Registry } from '@pliant/core';
```

See [TypeScript Types](/core/types) for detailed type information.

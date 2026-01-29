# Message Resolution

Pliant separates validation logic from error messages. This page covers the message resolution APIs.

## createMessageResolver()

Creates a function that resolves error codes to human-readable messages.

### Signature

```ts
function createMessageResolver(
  catalog: MessageCatalog
): MessageResolver
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `catalog` | `MessageCatalog` | Object mapping error codes to messages |

### Returns

`MessageResolver` — A function that resolves error codes to messages.

### Message Types

Messages can be strings or functions:

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  // Static string
  required: 'This field is required',
  email: 'Please enter a valid email',
  
  // Dynamic function receiving error details
  minLength: (d) => `Must be at least ${d.min} characters`,
  maxLength: (d) => `Cannot exceed ${d.max} characters`,
  length: (d) => `Must be between ${d.min} and ${d.max} characters`,
  range: (d) => `Must be between ${d.min} and ${d.max}`
});
```

### Function Parameters

Message functions receive the full error detail:

```ts
const messages = createMessageResolver({
  range: (detail) => {
    // detail: { code: 'range', min: 0, max: 100, value: -5 }
    const { min, max, value } = detail;
    if (value < min) return `Must be at least ${min}`;
    if (value > max) return `Cannot exceed ${max}`;
    return `Must be between ${min} and ${max}`;
  }
});
```

## applyMessages()

Applies messages to validation errors.

### Signature

```ts
function applyMessages(
  errors: ErrorMap | null,
  ctx: Context,
  resolver: MessageResolver
): ResolvedErrorMap | null
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `errors` | `ErrorMap \| null` | Errors from `evaluateRules()` |
| `ctx` | `Context` | Validation context |
| `resolver` | `MessageResolver` | Message resolver function |

### Returns

`ResolvedErrorMap | null` — Errors with `message` property added, or `null`.

### Example

```ts
import { 
  evaluateRules, 
  applyMessages, 
  createMessageResolver 
} from '@pliant/core';

const messages = createMessageResolver({
  required: 'Required',
  minLength: (d) => `At least ${d.min} characters`
});

const errors = evaluateRules(registry, 'ab', ctx, ['required', 'minLength']);
// { minLength: { code: 'minLength', min: 5, actual: 2 } }

const resolved = applyMessages(errors, ctx, messages);
// { minLength: { code: 'minLength', min: 5, actual: 2, message: 'At least 5 characters' } }
```

## Complete Example

```ts
import {
  createRegistry,
  addRules,
  evaluateRules,
  applyMessages,
  createMessageResolver,
  requiredRule,
  emailRule,
  minLengthRule,
  rangeRule
} from '@pliant/core';

// 1. Setup registry
const registry = createRegistry();
addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  password: minLengthRule({ min: 8 }),
  age: rangeRule({ min: 18, max: 120 })
});

// 2. Create message resolver
const messages = createMessageResolver({
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: (d) => `Password must be at least ${d.min} characters`,
  age: (d) => `Age must be between ${d.min} and ${d.max}`
});

// 3. Validate and resolve messages
function validate(field: string, value: unknown, rules: string[]) {
  const errors = evaluateRules(registry, value, { field }, rules);
  return applyMessages(errors, { field }, messages);
}

// Usage
const emailError = validate('email', 'bad', ['required', 'email']);
// { email: { code: 'email', value: 'bad', message: 'Please enter a valid email address' } }

const ageError = validate('age', 15, ['required', 'age']);
// { age: { code: 'range', min: 18, max: 120, value: 15, message: 'Age must be between 18 and 120' } }
```

## Missing Messages

If no message is found for an error code, the `message` property is undefined:

```ts
const messages = createMessageResolver({
  required: 'Required'
  // 'minLength' not defined
});

const errors = evaluateRules(registry, 'ab', ctx, ['minLength']);
const resolved = applyMessages(errors, ctx, messages);
// { minLength: { code: 'minLength', min: 5, actual: 2, message: undefined } }
```

::: tip
Always define messages for all rules you use. Consider adding a fallback:

```ts
const messages = createMessageResolver({
  required: 'Required',
  // ... other messages
});

// Wrap with fallback
function resolve(errors, ctx) {
  const resolved = applyMessages(errors, ctx, messages);
  if (resolved) {
    for (const key of Object.keys(resolved)) {
      if (!resolved[key].message) {
        resolved[key].message = 'Invalid value';
      }
    }
  }
  return resolved;
}
```
:::

## Field-Specific Messages

Use the context to provide field-specific messages:

```ts
const fieldMessages: Record<string, MessageCatalog> = {
  email: {
    required: 'Email is required',
    email: 'Invalid email format'
  },
  password: {
    required: 'Password is required',
    minLength: (d) => `Password needs ${d.min}+ characters`
  }
};

function validate(field: string, value: unknown, rules: string[]) {
  const errors = evaluateRules(registry, value, { field }, rules);
  
  // Use field-specific messages if available
  const catalog = fieldMessages[field] || defaultMessages;
  const resolver = createMessageResolver(catalog);
  
  return applyMessages(errors, { field }, resolver);
}
```

## See Also

- [Messages Guide](/guide/messages) — Conceptual overview
- [Error Structure](/guide/error-structure) — Understanding error objects

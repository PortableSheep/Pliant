# Messages

Pliant separates validation logic from message resolution. This makes it easy to support multiple languages, customize messages, and create dynamic content.

## Creating a Message Resolver

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  required: 'This field is required',
  email: 'Please enter a valid email',
  length: 'Invalid length'
});
```

## Message Types

### Static Strings

Simple string messages for straightforward errors:

```ts
{
  required: 'This field is required',
  email: 'Invalid email format',
  numeric: 'Must be a number'
}
```

### Dynamic Functions

Functions receive the error detail and can return contextual messages:

```ts
{
  length: (detail) => {
    if (detail.actual < detail.min) {
      return `Must be at least ${detail.min} characters`;
    }
    return `Must be no more than ${detail.max} characters`;
  },
  
  range: (detail) => `Must be between ${detail.min} and ${detail.max}`,
  
  min: (detail) => `Must be at least ${detail.min}`,
  
  max: (detail) => `Must be no more than ${detail.max}`
}
```

### Template Literals

Use template literals for clean, readable messages:

```ts
{
  length: (d) => `Must be ${d.min}-${d.max} characters (you entered ${d.actual})`,
  range: ({ min, max, actual }) => `Value ${actual} is outside range ${min}-${max}`
}
```

## Applying Messages

Use `applyMessages` to add messages to error objects:

```ts
import { applyMessages } from '@pliant/core';

const errors = evaluateRules(registry, '', {}, ['required', 'email']);
// { required: { code: 'required' } }

const resolved = applyMessages(errors, {}, messages);
// { required: { code: 'required', message: 'This field is required' } }
```

## Message Priority

Messages are resolved in this order:

1. **Rule-level message** - Defined in the rule itself
2. **Resolver message** - From `createMessageResolver`
3. **Fallback** - Error code used as message

```ts
// Rule with built-in message
addRules(registry, {
  specialEmail: {
    ...emailRule(),
    message: 'Please use your company email'  // Highest priority
  }
});

// Resolver message (used if no rule message)
const messages = createMessageResolver({
  email: 'Invalid email format'
});
```

## i18n Support

### Simple Approach

Create message resolvers per language:

```ts
const en = createMessageResolver({
  required: 'This field is required',
  email: 'Invalid email'
});

const es = createMessageResolver({
  required: 'Este campo es obligatorio',
  email: 'Correo electrónico inválido'
});

// Use based on locale
const messages = locale === 'es' ? es : en;
```

### With i18n Library

Integrate with your i18n solution:

```ts
import { t } from 'your-i18n-library';

const messages = createMessageResolver({
  required: () => t('validation.required'),
  email: () => t('validation.email'),
  length: (d) => t('validation.length', { min: d.min, max: d.max })
});
```

### Error Codes for Lookup

Use error codes as translation keys:

```ts
// errors.json
{
  "required": "This field is required",
  "email": "Please enter a valid email",
  "length": "Must be {min}-{max} characters"
}

// Usage
const messages = createMessageResolver(
  Object.fromEntries(
    Object.entries(translations).map(([code, template]) => [
      code,
      (detail) => interpolate(template, detail)
    ])
  )
);
```

## Field-Specific Messages

Override messages per field using context:

```ts
const messages = createMessageResolver({
  required: (detail, ctx) => {
    if (ctx.field === 'email') return 'Email is required';
    if (ctx.field === 'password') return 'Password is required';
    return 'This field is required';
  }
});
```

## Combining with Rule Messages

Rules can define their own messages:

```ts
addRules(registry, {
  passwordStrength: {
    validate: (value) => {
      if (!/[A-Z]/.test(value)) return { code: 'password_uppercase' };
      if (!/[0-9]/.test(value)) return { code: 'password_number' };
      return null;
    },
    message: (error) => {
      if (error.code === 'password_uppercase') return 'Must contain uppercase';
      if (error.code === 'password_number') return 'Must contain a number';
      return 'Invalid password';
    }
  }
});
```

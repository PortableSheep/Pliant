# Getting Started

This guide will help you get up and running with Pliant in minutes.

## Installation

::: code-group

```sh [npm]
npm install @pliant/core
```

```sh [yarn]
yarn add @pliant/core
```

```sh [pnpm]
pnpm add @pliant/core
```

:::

For Angular projects, also install the Angular adapter:

```sh
npm install @pliant/angular
```

## Quick Start

### 1. Create a Registry

The registry holds all your validation rules:

```ts
import { createRegistry, addRules } from '@pliant/core';

const registry = createRegistry();
```

### 2. Register Rules

Add the built-in rules you need:

```ts
import { 
  requiredRule, 
  emailRule, 
  lengthRule,
  rangeRule 
} from '@pliant/core';

addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  usernameLength: lengthRule({ min: 3, max: 20 }),
  ageRange: rangeRule({ min: 18, max: 120 })
});
```

### 3. Validate Values

Use `evaluateRules` to validate a value against one or more rules:

```ts
import { evaluateRules } from '@pliant/core';

// Validate a single field
const errors = evaluateRules(
  registry,
  '',           // value to validate
  { field: 'email' },  // context
  ['required', 'email'] // rules to apply
);

console.log(errors);
// { required: { code: 'required' } }
```

### 4. Add Human-Readable Messages

Create a message resolver for user-friendly error messages:

```ts
import { createMessageResolver, applyMessages } from '@pliant/core';

const messages = createMessageResolver({
  required: 'This field is required',
  email: 'Please enter a valid email',
  length: (detail) => `Must be ${detail.min}-${detail.max} characters`
});

const resolved = applyMessages(errors, {}, messages);
// { required: { code: 'required', message: 'This field is required' } }
```

## Complete Example

Here's a full example validating a signup form:

```ts
import {
  createRegistry,
  addRules,
  evaluateRules,
  applyMessages,
  createMessageResolver,
  requiredRule,
  emailRule,
  lengthRule,
  equalsRule
} from '@pliant/core';

// Setup
const registry = createRegistry();

addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  password: lengthRule({ min: 8, max: 64 }),
  equals: equalsRule()
});

const messages = createMessageResolver({
  required: 'This field is required',
  email: 'Please enter a valid email',
  length: (d) => `Must be ${d.min}-${d.max} characters`,
  equals: 'Passwords must match'
});

// Form data
const formData = {
  email: 'not-an-email',
  password: 'short',
  confirmPassword: 'different'
};

// Validate each field
function validateField(field: string, value: any, rules: any[]) {
  const errors = evaluateRules(registry, value, { field, data: formData }, rules);
  return errors ? applyMessages(errors, { field }, messages) : null;
}

console.log(validateField('email', formData.email, ['required', 'email']));
// { email: { code: 'email', message: 'Please enter a valid email' } }

console.log(validateField('password', formData.password, ['required', 'password']));
// { password: { code: 'length', min: 8, max: 64, actual: 5, message: 'Must be 8-64 characters' } }

console.log(validateField('confirmPassword', formData.confirmPassword, [
  { name: 'equals', options: { field: 'password' } }
]));
// { equals: { code: 'equals', message: 'Passwords must match' } }
```

## Next Steps

- [Why Pliant?](/guide/why-pliant) - Learn about Pliant's design philosophy
- [Rules & Registry](/guide/rules-registry) - Deep dive into the rule system
- [Angular Setup](/angular/setup) - Integrate with Angular
- [Rules Reference](/rules/) - Explore all built-in rules

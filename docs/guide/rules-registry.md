# Rules & Registry

The registry is the central container for all your validation rules. It provides a clean way to organize, access, and compose rules.

## Creating a Registry

```ts
import { createRegistry } from '@pliant/core';

const registry = createRegistry();
```

The registry is a simple object that holds rule definitions keyed by name.

## Adding Rules

Use `addRules` to register one or more rules:

```ts
import { addRules, requiredRule, emailRule, lengthRule } from '@pliant/core';

addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  username: lengthRule({ min: 3, max: 20 })
});
```

### Rule Factories

Pliant provides factory functions for all built-in rules. These functions accept default options:

```ts
// No options needed
requiredRule()

// With options
lengthRule({ min: 3, max: 20 })
rangeRule({ min: 0, max: 100, inclusive: true })
regexRule({ pattern: /^[a-z]+$/ })
```

## Rule Definition Structure

Every rule is an object with this shape:

```ts
interface RuleDef<TOptions, TValue> {
  // Default options for this rule
  options?: TOptions;
  
  // Default message (string or function)
  message?: string | ((detail: any) => string);
  
  // Parent rule to inherit from
  inherit?: string;
  
  // Sync validation function
  validate?: (value: TValue, context: Context, options: TOptions) => ErrorDetail | null;
  
  // Async validation function
  validateAsync?: (value: TValue, context: Context, options: TOptions) => Promise<ErrorDetail | null>;
}
```

## Using Rules

### Basic Usage

```ts
import { evaluateRules } from '@pliant/core';

const errors = evaluateRules(
  registry,
  'test@example.com',  // value
  { field: 'email' },  // context
  ['required', 'email'] // rule names
);
// null (valid)
```

### With Options Override

Pass a rule reference object to override options:

```ts
const errors = evaluateRules(
  registry,
  'ab',
  { field: 'username' },
  [
    'required',
    { name: 'username', options: { min: 5 } }  // Override min
  ]
);
// { username: { code: 'length', min: 5, max: 20, actual: 2 } }
```

## Context Object

The context provides information about the current validation:

```ts
interface Context {
  // Current field name
  field?: string;
  
  // All form data (for cross-field validation)
  data?: Record<string, any>;
  
  // Custom context data
  [key: string]: any;
}
```

### Cross-Field Validation

Use context for rules that reference other fields:

```ts
const errors = evaluateRules(
  registry,
  'different-password',
  { 
    field: 'confirmPassword',
    data: { password: 'my-password', confirmPassword: 'different-password' }
  },
  [{ name: 'equals', options: { field: 'password' } }]
);
// { equals: { code: 'equals' } }
```

## Multiple Registries

You can create multiple registries for different contexts:

```ts
const formRegistry = createRegistry();
const apiRegistry = createRegistry();

// Different rules for different contexts
addRules(formRegistry, {
  email: emailRule(),
  password: lengthRule({ min: 8 })
});

addRules(apiRegistry, {
  email: emailRule(),
  apiKey: regexRule({ pattern: /^sk_[a-z0-9]{32}$/ })
});
```

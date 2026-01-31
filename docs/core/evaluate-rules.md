# evaluateRules()

Evaluates one or more rules against a value, returning any validation errors.

## Signature

```ts
function evaluateRules<TData>(
  registry: Registry<TData>,
  value: unknown,
  ctx: Context<TData>,
  rules: string | string[]
): ErrorMap | null
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `registry` | `Registry<TData>` | The registry containing the rules |
| `value` | `unknown` | The value to validate |
| `ctx` | `Context<TData>` | Validation context |
| `rules` | `string \| string[]` | Rule name(s) to evaluate |

## Returns

`ErrorMap | null` — Object containing errors keyed by rule name, or `null` if valid.

## Example

```ts
import { 
  createRegistry, 
  addRules, 
  evaluateRules,
  requiredRule, 
  emailRule 
} from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  required: requiredRule(),
  email: emailRule()
});

// Validate
const errors = evaluateRules(
  registry,
  'not-an-email',
  { field: 'email' },
  ['required', 'email']
);

console.log(errors);
// {
//   email: { code: 'email', value: 'not-an-email' }
// }
```

## Context Object

The context provides information to rules:

```ts
interface Context<TData = Record<string, unknown>> {
  field: string;              // Field name being validated
  data?: TData;               // Additional form/app data
}
```

### Using `field`

The field name identifies which field is being validated:

```ts
const errors = evaluateRules(
  registry,
  value,
  { field: 'username' },
  ['required', 'minLength']
);
```

### Using `data`

Pass additional context for cross-field validation:

```ts
const formData = {
  password: 'secret123',
  confirmPassword: 'secret124'
};

const errors = evaluateRules(
  registry,
  formData.confirmPassword,
  { 
    field: 'confirmPassword',
    data: formData
  },
  ['equals']
);
```

## Single vs Multiple Rules

Both single rule name and arrays are supported:

```ts
// Single rule
const errors1 = evaluateRules(registry, value, ctx, 'required');

// Multiple rules
const errors2 = evaluateRules(registry, value, ctx, ['required', 'email']);
```

## Short-Circuit Behavior

Validation stops at the first failing rule:

```ts
addRules(registry, {
  required: requiredRule(),      // Fails first
  email: emailRule(),            // Not evaluated
  minLength: minLengthRule({ min: 5 })  // Not evaluated
});

// Empty string fails 'required', other rules not checked
const errors = evaluateRules(registry, '', ctx, ['required', 'email', 'minLength']);
// { required: { code: 'required' } }
```

## Error Shape

Each error is an `ErrorDetail` object:

```ts
interface ErrorDetail {
  code: string;          // Rule code (matches rule name by default)
  [key: string]: unknown; // Additional data from the rule
}
```

Different rules include different data:

```ts
// required
{ code: 'required' }

// email
{ code: 'email', value: 'bad' }

// minLength
{ code: 'minLength', min: 5, actual: 3 }

// range
{ code: 'range', min: 0, max: 100, value: -5 }
```

## Missing Rules

Referencing an unregistered rule throws an error:

```ts
// 'phone' not registered
const errors = evaluateRules(registry, '123', ctx, ['phone']);
// Error: rule 'phone' is not registered
```

## See Also

- [createRegistry()](/core/create-registry) — Create a registry
- [addRules()](/core/add-rules) — Register rules
- [applyMessages()](/core/apply-messages) — Add messages to errors

# required

Validates that a value is present and not empty.

## Import

```ts
import { requiredRule } from '@pliant/core';
```

## Signature

```ts
function requiredRule(options?: RequiredRuleOptions): RuleDef
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trim` | `boolean` | `true` | Treat whitespace-only strings as empty |
| `allowFalse` | `boolean` | `false` | Allow `false` as a valid (non-empty) value |
| `allowZero` | `boolean` | `true` | Allow `0` as a valid (non-empty) value |

## Error Detail

```ts
{
  code: 'required'
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, requiredRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  required: requiredRule()
});

// Fails validation
evaluateRules(registry, '', { field: 'name' }, ['required']);
// { required: { code: 'required' } }

evaluateRules(registry, null, { field: 'name' }, ['required']);
// { required: { code: 'required' } }

evaluateRules(registry, undefined, { field: 'name' }, ['required']);
// { required: { code: 'required' } }

// Passes validation
evaluateRules(registry, 'John', { field: 'name' }, ['required']);
// null
```

### Whitespace Handling

By default, whitespace-only strings are considered empty:

```ts
// Default behavior (trim: true)
addRules(registry, {
  required: requiredRule() // or requiredRule({ trim: true })
});

evaluateRules(registry, '   ', { field: 'name' }, ['required']);
// { required: { code: 'required' } }

// Allow whitespace-only values
addRules(registry, {
  required: requiredRule({ trim: false })
});

evaluateRules(registry, '   ', { field: 'name' }, ['required']);
// null (passes)
```

### Boolean Values

By default, `false` is considered empty:

```ts
// Default behavior (allowFalse: false)
addRules(registry, {
  required: requiredRule()
});

evaluateRules(registry, false, { field: 'agree' }, ['required']);
// { required: { code: 'required' } }

evaluateRules(registry, true, { field: 'agree' }, ['required']);
// null (passes)

// Allow false as a valid value
addRules(registry, {
  required: requiredRule({ allowFalse: true })
});

evaluateRules(registry, false, { field: 'agree' }, ['required']);
// null (passes)
```

### Numeric Zero

By default, `0` is considered a valid (non-empty) value:

```ts
// Default behavior (allowZero: true)
addRules(registry, {
  required: requiredRule()
});

evaluateRules(registry, 0, { field: 'quantity' }, ['required']);
// null (passes)

// Treat 0 as empty
addRules(registry, {
  required: requiredRule({ allowZero: false })
});

evaluateRules(registry, 0, { field: 'quantity' }, ['required']);
// { required: { code: 'required' } }
```

### Array Values

Empty arrays are considered empty:

```ts
evaluateRules(registry, [], { field: 'items' }, ['required']);
// { required: { code: 'required' } }

evaluateRules(registry, [1, 2, 3], { field: 'items' }, ['required']);
// null (passes)
```

## Empty Values

The following are considered empty:

- `null`
- `undefined`
- `''` (empty string)
- `'   '` (whitespace only, when `trim: true`)
- `[]` (empty array)
- `false` (boolean, unless `allowFalse: true`)
- `0` (number zero, when `allowZero: false`)

The following are NOT empty:

- `0` (number zero, by default since `allowZero` defaults to `true`)
- `false` (boolean, when `allowFalse: true`)
- `{}` (empty object)
- Non-empty arrays

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  required: 'This field is required'
});

// Or field-specific
const fieldMessages = {
  email: {
    required: 'Email address is required'
  },
  password: {
    required: 'Please enter your password'
  }
};
```

## Common Patterns

### First Rule

`required` is typically the first rule checked:

```ts
evaluateRules(registry, value, ctx, ['required', 'email', 'minLength']);
```

Since validation short-circuits, if `required` fails, other rules won't run.

### Optional Fields

For optional fields, simply don't include `required`:

```ts
// Optional email - only validated if provided
evaluateRules(registry, value, ctx, ['email']);

// Required email - must be present AND valid
evaluateRules(registry, value, ctx, ['required', 'email']);
```

### Inherited Required

Create semantic variants:

```ts
import { inheritRule, requiredRule } from '@pliant/core';

const nameRequired = inheritRule(requiredRule(), {
  code: 'nameRequired'
});

const emailRequired = inheritRule(requiredRule(), {
  code: 'emailRequired'
});

// Different messages for each
const messages = createMessageResolver({
  nameRequired: 'Please enter your name',
  emailRequired: 'Email is required for account creation'
});
```

## See Also

- [Built-in Rules](/rules/) — All rules
- [Rule Inheritance](/guide/rule-inheritance) — Creating variants

# Error Structure

Understanding Pliant's error structure is key to handling validation results effectively.

## Basic Error Shape

Every validation error is an object with at least a `code` property:

```ts
interface ErrorDetail {
  code: string;
  message?: string;
  [key: string]: any;
}
```

## Error Codes

Each rule produces a specific error code:

| Rule | Error Code |
|------|------------|
| `required` | `required` |
| `email` | `email` |
| `numeric` | `numeric` |
| `length` | `length` |
| `minLength` | `minLength` |
| `maxLength` | `maxLength` |
| `range` | `range` |
| `min` | `min` |
| `max` | `max` |
| `regex` | `regex` |
| `equals` | `equals` |

## Contextual Properties

Rules include relevant context in their errors:

### Length Rules

```ts
{
  code: 'length',
  min: 3,
  max: 20,
  actual: 2
}
```

### Range Rules

```ts
{
  code: 'range',
  min: 18,
  max: 120,
  actual: 15
}
```

### Regex Rules

```ts
{
  code: 'regex',
  pattern: '/^[a-z]+$/'
}
```

### Equals Rules

```ts
{
  code: 'equals',
  field: 'password',  // or 'value' if comparing to static value
  expected: 'secret123'
}
```

## Error Object Structure

When validating with multiple rules, errors are keyed by rule name:

```ts
const errors = evaluateRules(registry, '', {}, ['required', 'email']);
// Returns:
{
  required: { code: 'required' }
}

// Only the first failing rule returns an error (per rule name)
```

## With Messages

After applying messages:

```ts
const resolved = applyMessages(errors, ctx, messages);
// Returns:
{
  required: { 
    code: 'required', 
    message: 'This field is required' 
  }
}
```

## Null for Valid

A valid value returns `null`:

```ts
const errors = evaluateRules(registry, 'valid@email.com', {}, ['email']);
// Returns: null
```

## Working with Errors

### Check if Valid

```ts
const errors = evaluateRules(registry, value, ctx, rules);
const isValid = errors === null;
```

### Get First Error

```ts
if (errors) {
  const firstKey = Object.keys(errors)[0];
  const firstError = errors[firstKey];
  console.log(firstError.message);
}
```

### Get All Error Messages

```ts
if (errors) {
  const messages = Object.values(errors)
    .map(e => e.message)
    .filter(Boolean);
}
```

### Type-Safe Error Handling

```ts
interface LengthError {
  code: 'length';
  min: number;
  max: number;
  actual: number;
  message?: string;
}

if (errors?.username?.code === 'length') {
  const lengthError = errors.username as LengthError;
  console.log(`Need ${lengthError.min - lengthError.actual} more characters`);
}
```

## Angular Error Structure

In Angular, errors are nested under `pliant`:

```ts
// control.errors structure:
{
  pliant: {
    required: { code: 'required', message: '...' },
    email: { code: 'email', message: '...' }
  }
}
```

Access like this:

```ts
if (control.errors?.['pliant']) {
  const pliantErrors = control.errors['pliant'];
  // { required: {...}, email: {...} }
}
```

## Custom Error Properties

Custom rules can include any properties:

```ts
addRules(registry, {
  uniqueUsername: {
    validateAsync: async (value, ctx) => {
      const exists = await checkUsername(value);
      if (exists) {
        return {
          code: 'username_taken',
          username: value,
          suggestedAlternatives: ['user123', 'user_456']
        };
      }
      return null;
    }
  }
});

// Error:
{
  code: 'username_taken',
  username: 'john',
  suggestedAlternatives: ['john123', 'john_456']
}
```

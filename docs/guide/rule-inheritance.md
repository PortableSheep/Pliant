# Rule Inheritance

Rule inheritance lets you create specialized rules that extend existing ones. This promotes code reuse and keeps your validation DRY.

## Basic Inheritance

Use `inheritRule` to create a child rule:

```ts
import { inheritRule, lengthRule, addRules } from '@pliant/core';

addRules(registry, {
  // Base rule
  length: lengthRule({ min: 0, max: 256 }),
  
  // Inherited rules
  username: inheritRule('length', {
    options: { min: 3, max: 20 }
  }),
  password: inheritRule('length', {
    options: { min: 8, max: 64 }
  }),
  bio: inheritRule('length', {
    options: { max: 500 }
  })
});
```

## What Gets Inherited

When a rule inherits from a parent:

1. **Options are merged** - Child options override parent options
2. **Validation logic is reused** - The parent's `validate` function runs
3. **Messages can be overridden** - Or inherited from parent

```ts
// Parent rule
addRules(registry, {
  length: lengthRule({ min: 0, max: 256 })
});

// Child with custom message
addRules(registry, {
  tweetLength: inheritRule('length', {
    options: { max: 280 },
    message: 'Tweet exceeds 280 characters'
  })
});
```

## Inheritance Chain

Rules can inherit from inherited rules:

```ts
addRules(registry, {
  // Base
  length: lengthRule({ min: 0, max: 256 }),
  
  // First level
  textField: inheritRule('length', {
    options: { max: 1000 }
  }),
  
  // Second level
  shortText: inheritRule('textField', {
    options: { max: 100 }
  }),
  longText: inheritRule('textField', {
    options: { max: 5000 }
  })
});
```

## Built-in Inheritance

Some built-in rules use inheritance internally:

```ts
// minLength inherits from length
import { minLengthRule } from '@pliant/core';
const minLength = minLengthRule({ min: 8 });
// Equivalent to: inheritRule('length', { options: { min: 8 } })

// maxLength inherits from length
import { maxLengthRule } from '@pliant/core';
const maxLength = maxLengthRule({ max: 100 });
// Equivalent to: inheritRule('length', { options: { max: 100 } })
```

::: warning
When using `minLengthRule` or `maxLengthRule`, you must also register the base `length` rule:

```ts
addRules(registry, {
  length: lengthRule({ min: 0, max: 256 }), // Required!
  password: minLengthRule({ min: 8 })
});
```
:::

## Use Cases

### Domain-Specific Rules

```ts
addRules(registry, {
  // Base rules
  length: lengthRule(),
  range: rangeRule(),
  
  // Domain: User Profile
  username: inheritRule('length', { options: { min: 3, max: 20 } }),
  displayName: inheritRule('length', { options: { min: 1, max: 50 } }),
  bio: inheritRule('length', { options: { max: 500 } }),
  age: inheritRule('range', { options: { min: 13, max: 120 } }),
  
  // Domain: E-commerce
  productName: inheritRule('length', { options: { min: 3, max: 100 } }),
  productDescription: inheritRule('length', { options: { max: 2000 } }),
  price: inheritRule('range', { options: { min: 0, max: 99999 } }),
  quantity: inheritRule('range', { options: { min: 1, max: 999 } })
});
```

### Environment-Specific Rules

```ts
const isDev = process.env.NODE_ENV === 'development';

addRules(registry, {
  password: lengthRule({ 
    min: isDev ? 4 : 8,  // Relaxed in dev
    max: 64 
  })
});
```

### Feature Flags

```ts
addRules(registry, {
  username: inheritRule('length', {
    options: { 
      min: 3, 
      max: featureFlags.longUsernames ? 50 : 20 
    }
  })
});
```

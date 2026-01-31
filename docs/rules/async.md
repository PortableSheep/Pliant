# Async Rules

Async rules enable server-side validation like checking username availability or verifying data against an API.

## Structure

An async rule has an `validateAsync` method that returns a Promise:

```ts
import type { RuleDef, ErrorDetail, Context } from '@pliant/core';

const asyncRule: RuleDef = {
  // Optional: quick sync check first
  validate(value, ctx) {
    // Sync validation
    return null;
  },
  
  // Async validation
  async validateAsync(value, ctx): Promise<ErrorDetail | null> {
    const response = await fetch(`/api/validate?value=${value}`);
    const { valid } = await response.json();
    
    if (!valid) {
      return { code: 'asyncError', value };
    }
    return null;
  }
};
```

## Username Availability Example

```ts
const usernameAvailable: RuleDef = {
  // Quick sync check first
  validate(value, ctx) {
    if (!value) return null;
    const str = String(value);
    
    // Basic format check (sync)
    if (!/^[a-zA-Z0-9_]+$/.test(str)) {
      return { code: 'usernameFormat', value };
    }
    
    return null;
  },
  
  // Server check (async)
  async validateAsync(value, ctx) {
    if (!value) return null;
    
    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(String(value))}`);
      const { available } = await response.json();
      
      if (!available) {
        return { code: 'usernameTaken', value };
      }
    } catch (error) {
      // Decide: fail open or closed?
      return { code: 'usernameCheckFailed' };
    }
    
    return null;
  }
};
```

## Email Verification

```ts
const emailNotRegistered: RuleDef = {
  async validateAsync(value, ctx) {
    if (!value) return null;
    
    const response = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value })
    });
    
    const { exists } = await response.json();
    
    if (exists) {
      return {
        code: 'emailRegistered',
        value,
        suggestion: 'Try logging in instead'
      };
    }
    
    return null;
  }
};
```

## Running Async Validation

### Manual Execution

```ts
import { evaluateRules } from '@pliant/core';

async function validateField(field: string, value: unknown, rules: string[]) {
  // Run sync validation first
  const syncErrors = evaluateRules(registry, value, { field }, rules);
  if (syncErrors) return syncErrors;
  
  // Then run async validation
  for (const ruleName of rules) {
    const rule = registry.get(ruleName);
    if (rule?.validateAsync) {
      const error = await rule.validateAsync(value, { field });
      if (error) {
        return { [ruleName]: error };
      }
    }
  }
  
  return null;
}
```

### With Debouncing

```ts
import { debounce } from 'lodash-es';

const debouncedValidate = debounce(async (value: string, callback: (errors: any) => void) => {
  const errors = await validateField('username', value, ['username', 'usernameAvailable']);
  callback(errors);
}, 300);

// In your component
input.addEventListener('input', (e) => {
  debouncedValidate(e.target.value, (errors) => {
    updateUI(errors);
  });
});
```

## Factory Pattern

```ts
interface UniqueFieldOptions {
  endpoint: string;
  fieldName: string;
  errorCode: string;
}

function uniqueFieldRule(options: UniqueFieldOptions): RuleDef {
  return {
    async validateAsync(value, ctx) {
      if (!value) return null;
      
      const response = await fetch(
        `${options.endpoint}?${options.fieldName}=${encodeURIComponent(String(value))}`
      );
      const { exists } = await response.json();
      
      if (exists) {
        return { code: options.errorCode, value };
      }
      
      return null;
    }
  };
}

// Usage
addRules(registry, {
  uniqueUsername: uniqueFieldRule({
    endpoint: '/api/check-username',
    fieldName: 'username',
    errorCode: 'usernameTaken'
  }),
  uniqueEmail: uniqueFieldRule({
    endpoint: '/api/check-email',
    fieldName: 'email',
    errorCode: 'emailTaken'
  })
});
```

## Angular Integration

In Angular, use async validators:

```ts
import { pliantAsync } from '@pliant/angular';

// In your component
this.form = this.fb.group({
  username: ['', {
    validators: [pliant(this.registry, 'required', 'username')],
    asyncValidators: [pliantAsync(this.registry, 'usernameAvailable')],
    updateOn: 'blur'  // Don't spam the server
  }]
});
```

## Best Practices

### 1. Sync First, Async Second

```ts
const rule: RuleDef = {
  // Fast sync check catches obvious errors
  validate(value, ctx) {
    if (String(value).length < 3) {
      return { code: 'tooShort', min: 3 };
    }
    return null;
  },
  
  // Expensive async only if sync passes
  async validateAsync(value, ctx) {
    // Server check...
  }
};
```

### 2. Debounce User Input

Don't call the server on every keystroke:

```ts
// ❌ Bad - API call on every character
input.addEventListener('input', async (e) => {
  await validateAsync(e.target.value);
});

// ✅ Good - debounced
const debouncedValidate = debounce(validateAsync, 300);
input.addEventListener('input', (e) => {
  debouncedValidate(e.target.value);
});
```

### 3. Handle Network Errors

```ts
async validateAsync(value, ctx) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network error');
    // ...
  } catch (error) {
    // Option 1: Fail closed (safer)
    return { code: 'validationFailed', reason: 'network' };
    
    // Option 2: Fail open (better UX, validate server-side on submit)
    // return null;
  }
}
```

### 4. Show Loading State

```ts
async function validateWithLoading(field, value, rules) {
  setFieldState(field, 'validating');
  
  try {
    const errors = await validateField(field, value, rules);
    setFieldState(field, errors ? 'invalid' : 'valid');
    return errors;
  } catch {
    setFieldState(field, 'error');
    return { [field]: { code: 'validationFailed' } };
  }
}
```

### 5. Cache Results

```ts
const cache = new Map<string, boolean>();

const cachedUsernameCheck: RuleDef = {
  async validateAsync(value, ctx) {
    const key = String(value);
    
    if (cache.has(key)) {
      return cache.get(key) ? null : { code: 'usernameTaken', value };
    }
    
    const response = await fetch(`/api/check-username?u=${key}`);
    const { available } = await response.json();
    
    cache.set(key, available);
    
    return available ? null : { code: 'usernameTaken', value };
  }
};
```

## Messages

```ts
const messages = createMessageResolver({
  usernameTaken: 'This username is already taken',
  emailRegistered: 'This email is already registered',
  validationFailed: 'Unable to validate. Please try again.',
  usernameCheckFailed: 'Could not check username availability'
});
```

## See Also

- [Custom Rules](/rules/custom) — Sync custom rules
- [Angular Integration](/angular/index) — Framework integration

# Custom Rules

Create your own validation rules for domain-specific requirements.

## Rule Structure

A rule is an object with a `validate` method:

```ts
import type { RuleDef, Context, ErrorDetail } from '@pliant/core';

const myRule: RuleDef = {
  validate(value: unknown, ctx: Context): ErrorDetail | null {
    // Return null if valid
    // Return { code: 'myRule', ...details } if invalid
  }
};
```

## Basic Example

```ts
import { createRegistry, addRules } from '@pliant/core';
import type { RuleDef } from '@pliant/core';

// Rule that requires a positive number
const positiveNumber: RuleDef = {
  validate(value, ctx) {
    // Allow empty (combine with required for non-empty)
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return { code: 'positiveNumber', value };
    }
    
    return null;
  }
};

// Register and use
const registry = createRegistry();
addRules(registry, { positiveNumber });
```

## Error Detail

Return an object with at least a `code` property:

```ts
const ageRule: RuleDef = {
  validate(value, ctx) {
    const num = Number(value);
    if (num < 18) {
      return {
        code: 'underAge',      // Required: error code
        minAge: 18,            // Optional: for message template
        actualAge: num,        // Optional: for message template
        field: ctx.field       // Optional: field context
      };
    }
    return null;
  }
};

// In message resolver:
const messages = createMessageResolver({
  underAge: (d) => `Must be at least ${d.minAge} (you entered ${d.actualAge})`
});
```

## Using Context

The `ctx` parameter provides field information and form data:

```ts
interface Context<TData = Record<string, unknown>> {
  field: string;    // Current field name
  data?: TData;     // Form data for cross-field validation
}
```

### Cross-Field Validation

```ts
interface FormData {
  startDate: string;
  endDate: string;
}

const endAfterStart: RuleDef<FormData> = {
  validate(value, ctx) {
    const startDate = ctx.data?.startDate;
    if (!startDate || !value) return null;
    
    const start = new Date(startDate);
    const end = new Date(String(value));
    
    if (end <= start) {
      return {
        code: 'endAfterStart',
        startDate: startDate,
        endDate: value
      };
    }
    
    return null;
  }
};
```

### Conditional Validation

```ts
interface FormData {
  country: string;
  state: string;
}

const usStateRequired: RuleDef<FormData> = {
  validate(value, ctx) {
    // Only required for US addresses
    if (ctx.data?.country !== 'US') {
      return null;
    }
    
    if (!value || String(value).trim() === '') {
      return { code: 'usStateRequired' };
    }
    
    return null;
  }
};
```

## Factory Functions

For configurable rules, create factory functions:

```ts
interface BetweenOptions {
  min: number;
  max: number;
}

function betweenRule(options: BetweenOptions): RuleDef {
  return {
    validate(value, ctx) {
      if (value === '' || value === null || value === undefined) {
        return null;
      }
      
      const num = Number(value);
      if (num < options.min || num > options.max) {
        return {
          code: 'between',
          min: options.min,
          max: options.max,
          value: num
        };
      }
      
      return null;
    }
  };
}

// Usage
addRules(registry, {
  percentage: betweenRule({ min: 0, max: 100 }),
  age: betweenRule({ min: 18, max: 120 })
});
```

## Composing Rules

Combine multiple checks:

```ts
import { emailRule, minLengthRule } from '@pliant/core';

const workEmail: RuleDef = {
  validate(value, ctx) {
    // First check basic email format
    const emailResult = emailRule().validate(value, ctx);
    if (emailResult) return emailResult;
    
    // Then check minimum length
    const lengthResult = minLengthRule({ min: 10 }).validate(value, ctx);
    if (lengthResult) return lengthResult;
    
    // Finally check domain
    const email = String(value);
    if (!email.endsWith('@company.com')) {
      return { code: 'workEmail', value, domain: '@company.com' };
    }
    
    return null;
  }
};
```

## Strong Password Example

A complete strong password rule:

```ts
interface PasswordStrength {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
}

function strongPasswordRule(options: Partial<PasswordStrength> = {}): RuleDef {
  const config: PasswordStrength = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
    ...options
  };
  
  return {
    validate(value, ctx) {
      if (!value) return null;
      const str = String(value);
      
      const missing: string[] = [];
      
      if (str.length < config.minLength) {
        missing.push(`at least ${config.minLength} characters`);
      }
      if (config.requireUppercase && !/[A-Z]/.test(str)) {
        missing.push('an uppercase letter');
      }
      if (config.requireLowercase && !/[a-z]/.test(str)) {
        missing.push('a lowercase letter');
      }
      if (config.requireNumber && !/\d/.test(str)) {
        missing.push('a number');
      }
      if (config.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(str)) {
        missing.push('a special character');
      }
      
      if (missing.length > 0) {
        return {
          code: 'strongPassword',
          missing,
          value: str.length  // Don't expose password
        };
      }
      
      return null;
    }
  };
}

// Messages
const messages = createMessageResolver({
  strongPassword: (d) => `Password must include ${d.missing.join(', ')}`
});
```

## Credit Card Luhn Check

```ts
const creditCardLuhn: RuleDef = {
  validate(value, ctx) {
    if (!value) return null;
    const digits = String(value).replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return { code: 'creditCardLength', length: digits.length };
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return { code: 'creditCardInvalid' };
    }
    
    return null;
  }
};
```

## Best Practices

### 1. Allow Empty Values

Let `required` handle empty checks:

```ts
// ✅ Good
validate(value, ctx) {
  if (!value) return null;  // Allow empty
  // ... validation logic
}

// ❌ Avoid duplicate required logic
validate(value, ctx) {
  if (!value) return { code: 'myRule' };  // This is required's job
}
```

### 2. Use Descriptive Codes

```ts
// ✅ Good
return { code: 'passwordTooWeak' };
return { code: 'endDateBeforeStart' };

// ❌ Bad
return { code: 'invalid' };
return { code: 'error' };
```

### 3. Include Useful Data

```ts
// ✅ Good - data helps create better messages
return {
  code: 'tooShort',
  minLength: 8,
  actualLength: value.length
};

// ❌ Minimal
return { code: 'tooShort' };
```

### 4. Type Safety

```ts
// ✅ Use TypeScript generics
const myRule: RuleDef<MyFormData> = {
  validate(value, ctx) {
    ctx.data?.specificField;  // Type-safe access
  }
};
```

## See Also

- [Async Rules](/rules/async) — Server-side validation
- [inheritRule()](/core/inherit-rule) — Extend existing rules
- [Built-in Rules](/rules/) — Rules to build upon

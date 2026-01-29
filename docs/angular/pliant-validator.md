# pliant() Validator

The `pliant()` function creates an Angular `ValidatorFn` from Pliant rules.

## Import

```ts
import { pliant } from '@pliant/angular';
```

## Signature

```ts
function pliant(
  registry: Registry,
  ...rules: string[]
): ValidatorFn
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `registry` | `Registry` | The Pliant registry (from DI) |
| `...rules` | `string[]` | Rule names to apply |

## Returns

`ValidatorFn` — An Angular validator function.

## Basic Usage

```ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { pliant, PLIANT_REGISTRY } from '@pliant/angular';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <input formControlName="email">
      <input formControlName="password" type="password">
    </form>
  `
})
export class FormComponent {
  private fb = inject(FormBuilder);
  private registry = inject(PLIANT_REGISTRY);
  
  form = this.fb.group({
    // Single rule
    email: ['', pliant(this.registry, 'email')],
    
    // Multiple rules
    password: ['', pliant(this.registry, 'required', 'password')]
  });
}
```

## Error Structure

The validator sets errors on the control matching the Pliant error structure:

```ts
// After validation fails
control.errors = {
  email: {
    code: 'email',
    value: 'invalid',
    message: 'Please enter a valid email'  // If messages configured
  }
};
```

## Combining with Angular Validators

You can mix Pliant validators with built-in Angular validators:

```ts
import { Validators } from '@angular/forms';

form = this.fb.group({
  email: ['', [
    Validators.required,  // Angular's required
    pliant(this.registry, 'email')  // Pliant's email
  ]],
  
  // Or use all Pliant
  password: ['', pliant(this.registry, 'required', 'password')]
});
```

## Displaying Errors

### Simple Error Display

```ts
@Component({
  template: `
    <input formControlName="email">
    @if (form.controls.email.errors?.['email']?.message) {
      <span class="error">
        {{ form.controls.email.errors['email'].message }}
      </span>
    }
  `
})
```

### Helper Method

```ts
@Component({
  template: `
    <input formControlName="email">
    @if (getError('email'); as error) {
      <span class="error">{{ error }}</span>
    }
  `
})
export class FormComponent {
  getError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.errors || !control.touched) return null;
    
    const firstErrorKey = Object.keys(control.errors)[0];
    return control.errors[firstErrorKey]?.message || null;
  }
}
```

### Reusable Error Component

```ts
// error-message.component.ts
@Component({
  selector: 'app-error',
  standalone: true,
  template: `
    @if (message()) {
      <span class="error">{{ message() }}</span>
    }
  `
})
export class ErrorMessageComponent {
  control = input.required<AbstractControl>();
  
  message = computed(() => {
    const ctrl = this.control();
    if (!ctrl.errors || !ctrl.touched) return null;
    
    const key = Object.keys(ctrl.errors)[0];
    return ctrl.errors[key]?.message;
  });
}

// Usage
@Component({
  template: `
    <input formControlName="email">
    <app-error [control]="form.controls.email" />
  `
})
```

## Short-Circuit Behavior

Like core Pliant, validation stops at the first failing rule:

```ts
// If 'required' fails, 'email' is not checked
form = this.fb.group({
  email: ['', pliant(this.registry, 'required', 'email', 'minLength')]
});

// Empty value
// errors = { required: { code: 'required', message: '...' } }
```

## Dynamic Rules

Create validators dynamically:

```ts
export class DynamicFormComponent {
  private registry = inject(PLIANT_REGISTRY);
  
  createForm(fields: FieldConfig[]) {
    const group: Record<string, any> = {};
    
    for (const field of fields) {
      group[field.name] = [
        field.defaultValue || '',
        pliant(this.registry, ...field.rules)
      ];
    }
    
    return this.fb.group(group);
  }
}

// Usage
const form = this.createForm([
  { name: 'email', rules: ['required', 'email'] },
  { name: 'phone', rules: ['phone'] }
]);
```

## With FormArray

```ts
form = this.fb.group({
  emails: this.fb.array([
    ['', pliant(this.registry, 'required', 'email')]
  ])
});

addEmail() {
  const emails = this.form.get('emails') as FormArray;
  emails.push(this.fb.control('', pliant(this.registry, 'required', 'email')));
}
```

## See Also

- [Async Validation](/angular/async) — Server-side validation
- [Group Validation](/angular/group-validation) — Cross-field validation
- [Setup](/angular/setup) — Configuration

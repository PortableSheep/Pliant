# Angular Setup

Configure Pliant in your Angular application using dependency injection.

## App Configuration

### Standalone Apps (Angular 17+)

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { providePliantRules, providePliantMessages } from '@pliant/angular';
import {
  requiredRule,
  emailRule,
  minLengthRule,
  maxLengthRule,
  rangeRule,
  regexRule,
  equalsRule
} from '@pliant/core';

export const appConfig: ApplicationConfig = {
  providers: [
    // Register validation rules
    providePliantRules({
      required: requiredRule(),
      email: emailRule(),
      
      // Field-specific rules
      username: minLengthRule({ min: 3 }),
      password: minLengthRule({ min: 8 }),
      age: rangeRule({ min: 18, max: 120 }),
      phone: regexRule({ pattern: /^\d{10}$/ }),
      confirmPassword: equalsRule({ field: 'password' })
    }),
    
    // Register error messages
    providePliantMessages({
      required: 'This field is required',
      email: 'Please enter a valid email address',
      username: d => `Username must be at least ${d.min} characters`,
      password: d => `Password must be at least ${d.min} characters`,
      age: d => `Age must be between ${d.min} and ${d.max}`,
      phone: 'Please enter a 10-digit phone number',
      confirmPassword: 'Passwords do not match'
    })
  ]
};
```

```ts
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig);
```

### NgModule Apps

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { providePliantRules, providePliantMessages } from '@pliant/angular';
import { requiredRule, emailRule } from '@pliant/core';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  providers: [
    providePliantRules({
      required: requiredRule(),
      email: emailRule()
    }),
    providePliantMessages({
      required: 'Required',
      email: 'Invalid email'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Component Usage

### Injecting the Registry

```ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { pliant, PLIANT_REGISTRY, PLIANT_MESSAGES } from '@pliant/angular';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `...`
})
export class FormComponent {
  private fb = inject(FormBuilder);
  private registry = inject(PLIANT_REGISTRY);
  private messages = inject(PLIANT_MESSAGES);  // Optional
  
  form = this.fb.group({
    email: ['', pliant(this.registry, 'required', 'email')],
    password: ['', pliant(this.registry, 'required', 'password')]
  });
}
```

### Displaying Errors

```ts
@Component({
  template: `
    <form [formGroup]="form">
      <div class="field">
        <label>Email</label>
        <input formControlName="email">
        @if (form.controls.email.errors && form.controls.email.touched) {
          <span class="error">
            {{ getError('email') }}
          </span>
        }
      </div>
    </form>
  `
})
export class FormComponent {
  // ... injections and form setup
  
  getError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors) return '';
    
    // Pliant errors have a 'message' property
    const errorKey = Object.keys(control.errors)[0];
    return control.errors[errorKey]?.message || 'Invalid';
  }
}
```

## Feature Modules

Provide additional rules in feature modules:

```ts
// admin/admin.config.ts
import { providePliantRules, providePliantMessages } from '@pliant/angular';
import { regexRule } from '@pliant/core';

export const adminProviders = [
  // Additional rules for admin module
  providePliantRules({
    adminCode: regexRule({ pattern: /^ADM-\d{6}$/ })
  }),
  providePliantMessages({
    adminCode: 'Invalid admin code format (ADM-XXXXXX)'
  })
];
```

```ts
// admin/admin.routes.ts
import { Routes } from '@angular/router';
import { adminProviders } from './admin.config';

export const adminRoutes: Routes = [
  {
    path: '',
    providers: adminProviders,
    children: [
      // Admin routes...
    ]
  }
];
```

## Environment-Based Config

```ts
// app.config.ts
import { environment } from '../environments/environment';

const baseRules = {
  required: requiredRule(),
  email: emailRule()
};

const devRules = {
  ...baseRules,
  // Lenient rules for development
  password: minLengthRule({ min: 4 })
};

const prodRules = {
  ...baseRules,
  // Strict rules for production
  password: minLengthRule({ min: 12 })
};

export const appConfig: ApplicationConfig = {
  providers: [
    providePliantRules(environment.production ? prodRules : devRules),
    providePliantMessages({ /* ... */ })
  ]
};
```

## Testing

```ts
// form.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { providePliantRules, providePliantMessages } from '@pliant/angular';
import { requiredRule, emailRule } from '@pliant/core';
import { FormComponent } from './form.component';

describe('FormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent, ReactiveFormsModule],
      providers: [
        providePliantRules({
          required: requiredRule(),
          email: emailRule()
        }),
        providePliantMessages({
          required: 'Required',
          email: 'Invalid email'
        })
      ]
    }).compileComponents();
  });
  
  it('should validate email', () => {
    const fixture = TestBed.createComponent(FormComponent);
    const component = fixture.componentInstance;
    
    component.form.controls.email.setValue('invalid');
    expect(component.form.controls.email.valid).toBeFalse();
    
    component.form.controls.email.setValue('valid@email.com');
    expect(component.form.controls.email.valid).toBeTrue();
  });
});
```

## See Also

- [pliant() Validator](/angular/pliant-validator) — Using validators
- [Message Resolution](/core/messages) — Message configuration details

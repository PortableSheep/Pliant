import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { pliant } from "@pliant/angular";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="hero">
        <h1 class="hero-logo">Pliant + Angular</h1>
        <p class="hero-tagline">Reactive forms with DI-powered rules, inheritance, and structured errors.</p>
        <div class="badges">
          <span class="badge">🔌 DI Providers</span>
          <span class="badge">📋 ValidatorFn</span>
          <span class="badge">💬 Messages</span>
          <span class="badge">🔗 Cross-Field</span>
          <span class="badge">⚡ 11 Built-in Rules</span>
        </div>
        <div class="install-cmd">
          <span>$</span>
          <code>npm install &#64;pliant/angular &#64;pliant/core</code>
        </div>
      </header>

      <main class="main-card">
        <nav class="nav-tabs">
          <button class="nav-tab" [class.active]="activeTab === 'demo'" (click)="activeTab = 'demo'">Live Demo</button>
          <button class="nav-tab" [class.active]="activeTab === 'rules'" (click)="activeTab = 'rules'">All Rules</button>
          <button class="nav-tab" [class.active]="activeTab === 'setup'" (click)="activeTab = 'setup'">Setup Code</button>
          <button class="nav-tab" [class.active]="activeTab === 'api'" (click)="activeTab = 'api'">API Reference</button>
        </nav>

        <!-- Live Demo Panel -->
        <div class="tab-panel" *ngIf="activeTab === 'demo'">
          <div class="section-header">
            <h2 class="section-title">Interactive Validation Demo</h2>
            <p class="section-desc">All 11 built-in rules showcased with DI-powered validation. Try each field to see real-time feedback.</p>
          </div>

          <div class="split">
            <div>
              <form [formGroup]="form" class="form-grid">
                <div class="field">
                  <label for="required">Required Field</label>
                  <input id="required" formControlName="required" placeholder="Type anything..."
                    [class.valid]="requiredCtrl.valid && requiredCtrl.touched"
                    [class.invalid]="requiredCtrl.invalid && requiredCtrl.touched" />
                  <div class="field-hint">Uses <code>required</code> rule – must not be empty</div>
                  <div class="field-error" *ngIf="requiredCtrl.invalid && requiredCtrl.touched">
                    {{ getFirstError(requiredCtrl) }}
                  </div>
                </div>

                <div class="field">
                  <label for="email">Email Address</label>
                  <input id="email" formControlName="email" type="email" placeholder="you&#64;example.com"
                    [class.valid]="email.valid && email.touched"
                    [class.invalid]="email.invalid && email.touched" />
                  <div class="field-hint">Uses <code>email</code> rule – validates email format</div>
                  <div class="field-error" *ngIf="email.invalid && email.touched">
                    {{ getFirstError(email) }}
                  </div>
                </div>

                <div class="field">
                  <label for="username">Username (3-20 chars)</label>
                  <input id="username" formControlName="username" placeholder="johndoe"
                    [class.valid]="username.valid && username.touched"
                    [class.invalid]="username.invalid && username.touched" />
                  <div class="field-hint">Uses <code>length</code> rule – exact range validation</div>
                  <div class="field-error" *ngIf="username.invalid && username.touched">
                    {{ getFirstError(username) }}
                  </div>
                </div>

                <div class="field">
                  <label for="bio">Bio (max 100 chars)</label>
                  <input id="bio" formControlName="bio" placeholder="Tell us about yourself..."
                    [class.valid]="bio.valid && bio.touched"
                    [class.invalid]="bio.invalid && bio.touched" />
                  <div class="field-hint">Uses <code>maxLength</code> rule – maximum characters</div>
                  <div class="field-error" *ngIf="bio.invalid && bio.touched">
                    {{ getFirstError(bio) }}
                  </div>
                </div>

                <div class="field">
                  <label for="age">Age (18-120)</label>
                  <input id="age" formControlName="age" type="number" placeholder="25"
                    [class.valid]="age.valid && age.touched"
                    [class.invalid]="age.invalid && age.touched" />
                  <div class="field-hint">Uses <code>range</code> rule – min/max value</div>
                  <div class="field-error" *ngIf="age.invalid && age.touched">
                    {{ getFirstError(age) }}
                  </div>
                </div>

                <div class="field">
                  <label for="score">Score (min: 0)</label>
                  <input id="score" formControlName="score" type="number" placeholder="85"
                    [class.valid]="score.valid && score.touched"
                    [class.invalid]="score.invalid && score.touched" />
                  <div class="field-hint">Uses <code>min</code> rule – minimum value only</div>
                  <div class="field-error" *ngIf="score.invalid && score.touched">
                    {{ getFirstError(score) }}
                  </div>
                </div>

                <div class="field">
                  <label for="discount">Discount % (max: 100)</label>
                  <input id="discount" formControlName="discount" type="number" placeholder="25"
                    [class.valid]="discount.valid && discount.touched"
                    [class.invalid]="discount.invalid && discount.touched" />
                  <div class="field-hint">Uses <code>max</code> rule – maximum value only</div>
                  <div class="field-error" *ngIf="discount.invalid && discount.touched">
                    {{ getFirstError(discount) }}
                  </div>
                </div>

                <div class="field">
                  <label for="zipcode">Numeric ID</label>
                  <input id="zipcode" formControlName="zipcode" placeholder="12345"
                    [class.valid]="zipcode.valid && zipcode.touched"
                    [class.invalid]="zipcode.invalid && zipcode.touched" />
                  <div class="field-hint">Uses <code>numeric</code> rule – digits only</div>
                  <div class="field-error" *ngIf="zipcode.invalid && zipcode.touched">
                    {{ getFirstError(zipcode) }}
                  </div>
                </div>

                <div class="field">
                  <label for="slug">URL Slug</label>
                  <input id="slug" formControlName="slug" placeholder="my-cool-post"
                    [class.valid]="slug.valid && slug.touched"
                    [class.invalid]="slug.invalid && slug.touched" />
                  <div class="field-hint">Uses <code>regex</code> rule – custom pattern</div>
                  <div class="field-error" *ngIf="slug.invalid && slug.touched">
                    {{ getFirstError(slug) }}
                  </div>
                </div>

                <div class="field">
                  <label for="password">Password</label>
                  <input id="password" formControlName="password" type="password" placeholder="Min 8 characters"
                    [class.valid]="password.valid && password.touched"
                    [class.invalid]="password.invalid && password.touched" />
                  <div class="field-hint">Uses <code>minLength</code> rule</div>
                  <div class="field-error" *ngIf="password.invalid && password.touched">
                    {{ getFirstError(password) }}
                  </div>
                </div>

                <div class="field">
                  <label for="confirm">Confirm Password</label>
                  <input id="confirm" formControlName="confirm" type="password" placeholder="Repeat your password"
                    [class.valid]="confirm.valid && confirm.touched"
                    [class.invalid]="confirm.invalid && confirm.touched" />
                  <div class="field-hint">Uses <code>equals</code> rule – cross-field validation</div>
                  <div class="field-error" *ngIf="confirm.invalid && confirm.touched">
                    {{ getFirstError(confirm) }}
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-primary" (click)="onSubmit()">
                    Submit Form
                  </button>
                  <span class="submit-status" [class.visible]="submitStatus" [class.success]="submitSuccess" [class.error]="!submitSuccess">
                    {{ submitStatus }}
                  </span>
                </div>
              </form>

              <div class="validation-summary">
                <div class="summary-header">
                  <span class="summary-title">Validation Summary</span>
                  <span class="status-badge" [class.valid]="form.valid" [class.invalid]="form.invalid">
                    {{ form.valid ? '✓ All Valid' : invalidCount + ' Invalid' }}
                  </span>
                </div>
                <div class="field-status" *ngFor="let field of fieldNames">
                  <span class="field-status-icon" [class.valid]="getControl(field).valid || getControl(field).pristine" [class.invalid]="getControl(field).invalid && getControl(field).touched">
                    {{ (getControl(field).valid || getControl(field).pristine) ? '✓' : '✕' }}
                  </span>
                  <span class="field-status-name">{{ getFieldLabel(field) }}</span>
                  <span class="field-status-message">
                    {{ getControl(field).invalid && getControl(field).touched ? getFirstError(getControl(field)) : 'Valid' }}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div class="code-block">
                <div class="code-header">
                  <span class="code-title">Form Setup</span>
                </div>
                <pre class="code-content" [innerHTML]="formSetupCode"></pre>
              </div>

              <div class="callout">
                <div class="callout-title">💡 Angular Integration</div>
                <p class="callout-text">Rules are injected via <code>providePliantRules()</code> and consumed with the <code>pliant()</code> validator. Messages are resolved automatically via <code>providePliantMessages()</code>.</p>
              </div>

              <div class="code-block" style="margin-top: 20px;">
                <div class="code-header">
                  <span class="code-title">Live Error Output (JSON)</span>
                </div>
                <pre class="json-output" [innerHTML]="liveErrorsHtml"></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- All Rules Panel -->
        <div class="tab-panel" *ngIf="activeTab === 'rules'">
          <div class="section-header">
            <h2 class="section-title">Built-in Rules Reference</h2>
            <p class="section-desc">Pliant ships with 11 battle-tested validation rules. Each returns a structured error object with a <code>code</code> and contextual details.</p>
          </div>

          <table class="rules-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Options</th>
                <th>Description</th>
                <th>Error Code</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="rule-name">required</span></td>
                <td><span class="rule-options">none</span></td>
                <td>Validates value is not empty, null, or undefined</td>
                <td><code>required</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">email</span></td>
                <td><span class="rule-options">none</span></td>
                <td>Validates standard email format</td>
                <td><code>email</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">numeric</span></td>
                <td><span class="rule-options">none</span></td>
                <td>Validates value contains only digits</td>
                <td><code>numeric</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">length</span></td>
                <td><span class="rule-options">{{ '{' }} min, max {{ '}' }}</span></td>
                <td>Validates string length is within range</td>
                <td><code>length</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">minLength</span></td>
                <td><span class="rule-options">{{ '{' }} min {{ '}' }}</span></td>
                <td>Validates minimum string length</td>
                <td><code>minLength</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">maxLength</span></td>
                <td><span class="rule-options">{{ '{' }} max {{ '}' }}</span></td>
                <td>Validates maximum string length</td>
                <td><code>maxLength</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">range</span></td>
                <td><span class="rule-options">{{ '{' }} min, max, inclusive? {{ '}' }}</span></td>
                <td>Validates numeric value is within range</td>
                <td><code>range</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">min</span></td>
                <td><span class="rule-options">{{ '{' }} min, inclusive? {{ '}' }}</span></td>
                <td>Validates minimum numeric value</td>
                <td><code>min</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">max</span></td>
                <td><span class="rule-options">{{ '{' }} max, inclusive? {{ '}' }}</span></td>
                <td>Validates maximum numeric value</td>
                <td><code>max</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">regex</span></td>
                <td><span class="rule-options">{{ '{' }} pattern {{ '}' }}</span></td>
                <td>Validates value matches regular expression</td>
                <td><code>regex</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">equals</span></td>
                <td><span class="rule-options">{{ '{' }} field {{ '}' }} | {{ '{' }} value {{ '}' }}</span></td>
                <td>Validates value equals another field or static value</td>
                <td><code>equals</code></td>
              </tr>
            </tbody>
          </table>

          <div class="callout" style="margin-top: 32px;">
            <div class="callout-title">🔗 Rule Inheritance</div>
            <p class="callout-text">Use <code>inheritRule(parentName, overrides)</code> to create specialized rules that extend existing ones. Perfect for creating domain-specific validations like "usernameLength" from "length".</p>
          </div>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">📦</div>
              <div class="feature-title">Structured Errors</div>
              <p class="feature-desc">Each rule returns a typed error object with <code>code</code>, contextual details, and optional <code>message</code> – perfect for i18n.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔄</div>
              <div class="feature-title">Composable</div>
              <p class="feature-desc">Rules are pure functions. Combine multiple rules on a single field with <code>pliant(['required', 'email'])</code>.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <div class="feature-title">Framework Agnostic</div>
              <p class="feature-desc">Rules from <code>&#64;pliant/core</code> work everywhere. The Angular adapter just provides DI integration.</p>
            </div>
          </div>
        </div>

        <!-- Setup Code Panel -->
        <div class="tab-panel" *ngIf="activeTab === 'setup'">
          <div class="section-header">
            <h2 class="section-title">Angular Setup</h2>
            <p class="section-desc">Configure Pliant rules and messages via Angular's dependency injection system.</p>
          </div>

          <div class="split">
            <div>
              <h3 class="code-section-title">1. Bootstrap with Providers</h3>
              <div class="code-block">
                <div class="code-header">
                  <span class="code-title">main.ts</span>
                </div>
                <pre class="code-content" [innerHTML]="mainTsCodeHighlighted"></pre>
              </div>
            </div>

            <div>
              <h3 class="code-section-title">2. Use in Components</h3>
              <div class="code-block">
                <div class="code-header">
                  <span class="code-title">app.component.ts</span>
                </div>
                <pre class="code-content" [innerHTML]="componentCodeHighlighted"></pre>
              </div>
            </div>
          </div>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">🔌</div>
              <div class="feature-title">providePliantRules()</div>
              <p class="feature-desc">Register your rule definitions at the app or component level. Rules are inherited and merged automatically.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💬</div>
              <div class="feature-title">providePliantMessages()</div>
              <p class="feature-desc">Provide message templates for error codes. Supports static strings and dynamic functions.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">✅</div>
              <div class="feature-title">pliant() Validator</div>
              <p class="feature-desc">Returns a ValidatorFn that evaluates rules by name. Errors are attached under <code>errors.pliant</code>.</p>
            </div>
          </div>
        </div>

        <!-- API Reference Panel -->
        <div class="tab-panel" *ngIf="activeTab === 'api'">
          <div class="section-header">
            <h2 class="section-title">Angular API Reference</h2>
            <p class="section-desc">Complete reference for <code>&#64;pliant/angular</code> exports.</p>
          </div>

          <table class="rules-table">
            <thead>
              <tr>
                <th>Export</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="rule-name">providePliantRules(rules)</span></td>
                <td>Provider</td>
                <td>Registers rule definitions in the DI container</td>
              </tr>
              <tr>
                <td><span class="rule-name">providePliantMessages(catalog)</span></td>
                <td>Provider</td>
                <td>Registers message templates for error resolution</td>
              </tr>
              <tr>
                <td><span class="rule-name">pliant(rules)</span></td>
                <td>ValidatorFn</td>
                <td>Creates a sync validator from rule names/refs</td>
              </tr>
              <tr>
                <td><span class="rule-name">pliantAsync(rules)</span></td>
                <td>AsyncValidatorFn</td>
                <td>Creates an async validator for rules with <code>validateAsync</code></td>
              </tr>
              <tr>
                <td><span class="rule-name">pliantGroup(rules)</span></td>
                <td>ValidatorFn</td>
                <td>Creates a validator for FormGroup-level validation</td>
              </tr>
              <tr>
                <td><span class="rule-name">PLIANT_RULES</span></td>
                <td>InjectionToken</td>
                <td>Token to inject the rule registry directly</td>
              </tr>
              <tr>
                <td><span class="rule-name">PLIANT_MESSAGES</span></td>
                <td>InjectionToken</td>
                <td>Token to inject the message resolver directly</td>
              </tr>
            </tbody>
          </table>

          <div class="callout" style="margin-top: 32px;">
            <div class="callout-title">📦 Error Structure</div>
            <p class="callout-text">Pliant validators attach errors under <code>control.errors.pliant</code>. Each rule that fails adds an entry keyed by rule name with the full error detail including <code>code</code>, <code>message</code>, and any rule-specific properties.</p>
          </div>

          <div class="code-block" style="margin-top: 24px;">
            <div class="code-header">
              <span class="code-title">Error Object Example</span>
            </div>
            <pre class="json-output" [innerHTML]="errorExampleHtml"></pre>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }

    .hero {
      text-align: center;
      padding: 48px 24px;
      margin-bottom: 48px;
    }

    .hero-logo {
      font-size: 56px;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 16px;
      letter-spacing: -0.04em;
    }

    .hero-tagline {
      font-size: 18px;
      color: rgba(255,255,255,0.9);
      margin: 0 0 24px;
      font-weight: 500;
    }

    .badges {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .badge {
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      background: rgba(255,255,255,0.2);
      color: #fff;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .install-cmd {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px 24px;
      border-radius: 12px;
      font-family: "JetBrains Mono", monospace;
      font-size: 14px;
    }

    .install-cmd code {
      color: #a5f3fc;
    }

    .main-card {
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      overflow: hidden;
    }

    .nav-tabs {
      display: flex;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
    }

    .nav-tab {
      padding: 16px 24px;
      font-weight: 600;
      font-size: 14px;
      color: #64748b;
      cursor: pointer;
      border: none;
      background: none;
      transition: all 0.2s;
      position: relative;
    }

    .nav-tab:hover {
      color: #0f172a;
    }

    .nav-tab.active {
      color: #4f46e5;
      background: #ffffff;
    }

    .nav-tab.active::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #4f46e5;
    }

    .tab-panel {
      padding: 32px;
    }

    .section-header {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .section-desc {
      color: #64748b;
      margin: 0;
    }

    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }

    @media (max-width: 900px) {
      .split {
        grid-template-columns: 1fr;
      }
    }

    .form-grid {
      display: grid;
      gap: 20px;
    }

    .field label {
      display: block;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .field input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      font-size: 15px;
      transition: all 0.2s;
    }

    .field input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    }

    .field input.valid {
      border-color: #10b981;
    }

    .field input.invalid {
      border-color: #ef4444;
    }

    .field-hint {
      font-size: 12px;
      color: #64748b;
      margin-top: 6px;
    }

    .field-error {
      font-size: 13px;
      color: #ef4444;
      margin-top: 6px;
    }

    .validation-summary {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
      border: 1px solid #e2e8f0;
    }

    .summary-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .summary-title {
      font-weight: 700;
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }

    .status-badge.valid {
      background: #ecfdf5;
      color: #059669;
    }

    .status-badge.invalid {
      background: #fef2f2;
      color: #dc2626;
    }

    .field-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .field-status:last-child {
      border-bottom: none;
    }

    .field-status-name {
      font-weight: 600;
      min-width: 100px;
    }

    .field-status-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
    }

    .field-status-icon.valid {
      background: #10b981;
      color: white;
    }

    .field-status-icon.invalid {
      background: #ef4444;
      color: white;
    }

    .field-status-message {
      flex: 1;
      font-size: 13px;
      color: #64748b;
    }

    .code-block {
      background: #0f172a;
      border-radius: 12px;
      overflow: hidden;
    }

    .code-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .code-title {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .code-content {
      padding: 20px;
      overflow-x: auto;
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      line-height: 1.7;
      color: #e2e8f0;
      margin: 0;
      white-space: pre-wrap;
    }

    .json-output {
      padding: 16px;
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      color: #e2e8f0;
      min-height: 300px;
      max-height: 50vh;
      overflow: auto;
      white-space: pre;
    }

    /* JSON Syntax Highlighting - use ::ng-deep to style innerHTML content */
    .json-output ::ng-deep .json-key { color: #7dd3fc; }
    .json-output ::ng-deep .json-string { color: #a5f3fc; }
    .json-output ::ng-deep .json-number { color: #f472b6; }
    .json-output ::ng-deep .json-boolean { color: #c084fc; }
    .json-output ::ng-deep .json-null { color: #94a3b8; }
    .json-output ::ng-deep .json-comment { color: #64748b; font-style: italic; }

    /* Code Syntax Highlighting - use ::ng-deep to style innerHTML content */
    .code-content ::ng-deep .keyword { color: #c084fc; }
    .code-content ::ng-deep .string { color: #a5f3fc; }
    .code-content ::ng-deep .function { color: #7dd3fc; }
    .code-content ::ng-deep .number { color: #f472b6; }
    .code-content ::ng-deep .comment { color: #64748b; font-style: italic; }
    .code-content ::ng-deep .property { color: #94a3b8; }
    .code-content ::ng-deep .decorator { color: #fbbf24; }
    .code-content ::ng-deep .class { color: #34d399; }
    .code-content ::ng-deep .regex { color: #fb923c; }

    .callout {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
      border-left: 4px solid #4f46e5;
      border-radius: 0 12px 12px 0;
      padding: 16px 20px;
      margin: 24px 0;
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 4px;
      color: #4f46e5;
    }

    .callout-text {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .code-section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 32px;
    }

    .feature-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #e2e8f0;
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }

    .feature-title {
      font-weight: 700;
      margin-bottom: 8px;
      font-family: "JetBrains Mono", monospace;
    }

    .feature-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .rules-table {
      width: 100%;
      border-collapse: collapse;
    }

    .rules-table th, .rules-table td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .rules-table th {
      background: #f8fafc;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }

    .rule-name {
      font-family: "JetBrains Mono", monospace;
      font-weight: 600;
      color: #4f46e5;
    }

    .rule-options {
      font-family: "JetBrains Mono", monospace;
      font-size: 12px;
      color: #64748b;
    }

    .btn {
      padding: 14px 28px;
      border-radius: 10px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .form-actions {
      margin-top: 24px;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .submit-status {
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 8px;
      display: none;
    }

    .submit-status.visible {
      display: block;
    }

    .submit-status.success {
      background: #ecfdf5;
      color: #059669;
    }

    .submit-status.error {
      background: #fef2f2;
      color: #dc2626;
    }
  `]
})
export class AppComponent {
  activeTab = "demo";
  submitStatus = "";
  submitSuccess = false;

  fieldNames = ['required', 'email', 'username', 'bio', 'age', 'score', 'discount', 'zipcode', 'slug', 'password', 'confirm'];

  fieldLabels: Record<string, string> = {
    required: 'Required',
    email: 'Email',
    username: 'Username',
    bio: 'Bio',
    age: 'Age',
    score: 'Score',
    discount: 'Discount',
    zipcode: 'Numeric ID',
    slug: 'URL Slug',
    password: 'Password',
    confirm: 'Confirm'
  };

  form = new FormGroup({
    required: new FormControl("", { validators: [pliant(["required"])] }),
    email: new FormControl("", { validators: [pliant(["email"])] }),
    username: new FormControl("", { validators: [pliant(["usernameLength"])] }),
    bio: new FormControl("", { validators: [pliant(["bioLength"])] }),
    age: new FormControl("", { validators: [pliant(["ageRange"])] }),
    score: new FormControl("", { validators: [pliant(["scoreMin"])] }),
    discount: new FormControl("", { validators: [pliant(["discountMax"])] }),
    zipcode: new FormControl("", { validators: [pliant(["numeric"])] }),
    slug: new FormControl("", { validators: [pliant(["slugPattern"])] }),
    password: new FormControl("", { validators: [pliant(["passwordLength"])] }),
    confirm: new FormControl("", { validators: [pliant([{ name: "equals", options: { field: "password" } }])] })
  });

  get requiredCtrl() { return this.form.get("required") as FormControl; }
  get email() { return this.form.get("email") as FormControl; }
  get username() { return this.form.get("username") as FormControl; }
  get bio() { return this.form.get("bio") as FormControl; }
  get password() { return this.form.get("password") as FormControl; }
  get confirm() { return this.form.get("confirm") as FormControl; }
  get age() { return this.form.get("age") as FormControl; }
  get score() { return this.form.get("score") as FormControl; }
  get discount() { return this.form.get("discount") as FormControl; }
  get zipcode() { return this.form.get("zipcode") as FormControl; }
  get slug() { return this.form.get("slug") as FormControl; }

  get invalidCount(): number {
    return Object.keys(this.form.controls).filter(
      (key) => this.form.get(key)?.invalid && this.form.get(key)?.touched
    ).length;
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  getFieldLabel(name: string): string {
    return this.fieldLabels[name] || name;
  }

  getFirstError(control: FormControl): string {
    if (!control.errors?.["pliant"]) return "";
    const pliantErrors = control.errors["pliant"];
    const firstKey = Object.keys(pliantErrors)[0];
    return pliantErrors[firstKey]?.message || pliantErrors[firstKey]?.code || "Invalid";
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this.submitStatus = "✓ Form submitted successfully!";
      this.submitSuccess = true;
      setTimeout(() => {
        this.submitStatus = "";
      }, 3000);
    } else {
      const count = Object.keys(this.form.controls).filter(
        (key) => this.form.get(key)?.invalid
      ).length;
      this.submitStatus = `✕ Please fix ${count} error${count > 1 ? "s" : ""} before submitting`;
      this.submitSuccess = false;
    }
  }

  // Collect all errors across all fields
  get allErrors(): Record<string, any> {
    const errors: Record<string, any> = {};
    this.fieldNames.forEach((name) => {
      const control = this.getControl(name);
      if (control.errors?.["pliant"] && control.touched) {
        errors[this.fieldLabels[name]] = control.errors["pliant"];
      }
    });
    return errors;
  }

  // JSON syntax highlighting
  syntaxHighlightJSON(obj: any): string {
    const json = JSON.stringify(obj, null, 2);
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = "json-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "json-key";
          } else {
            cls = "json-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "json-boolean";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${match}</span>`;
      });
  }

  get liveErrorsHtml(): string {
    const errors = this.allErrors;
    if (Object.keys(errors).length === 0) {
      return '<span class="json-comment">// No errors – all fields are valid!</span>';
    }
    return this.syntaxHighlightJSON(errors);
  }

  formSetupCode = `<span class="keyword">form</span> = <span class="keyword">new</span> <span class="function">FormGroup</span>({
  <span class="property">required</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
    <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"required"</span>])]
  }),
  <span class="property">email</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
    <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"email"</span>])]
  }),
  <span class="property">username</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
    <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"usernameLength"</span>])]
  }),
  <span class="property">password</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
    <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"passwordLength"</span>])]
  }),
  <span class="property">confirm</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
    <span class="property">validators</span>: [<span class="function">pliant</span>([
      { <span class="property">name</span>: <span class="string">"equals"</span>, <span class="property">options</span>: { <span class="property">field</span>: <span class="string">"password"</span> } }
    ])]
  })
});`;

  mainTsCodeHighlighted = `<span class="keyword">import</span> { bootstrapApplication } <span class="keyword">from</span> <span class="string">"@angular/platform-browser"</span>;
<span class="keyword">import</span> { <span class="function">providePliantMessages</span>, <span class="function">providePliantRules</span> } <span class="keyword">from</span> <span class="string">"@pliant/angular"</span>;
<span class="keyword">import</span> {
  <span class="function">equalsRule</span>, <span class="function">lengthRule</span>, <span class="function">requiredRule</span>,
  <span class="function">emailRule</span>, <span class="function">rangeRule</span>, <span class="function">minRule</span>, <span class="function">maxRule</span>, <span class="function">numericRule</span>,
  <span class="function">regexRule</span>, <span class="function">minLengthRule</span>, <span class="function">maxLengthRule</span>
} <span class="keyword">from</span> <span class="string">"@pliant/core"</span>;

<span class="function">bootstrapApplication</span>(AppComponent, {
  <span class="property">providers</span>: [
    <span class="function">providePliantRules</span>({
      <span class="property">required</span>: <span class="function">requiredRule</span>(),
      <span class="property">email</span>: <span class="function">emailRule</span>(),
      <span class="property">numeric</span>: <span class="function">numericRule</span>(),
      <span class="property">length</span>: <span class="function">lengthRule</span>({ <span class="property">min</span>: <span class="number">0</span>, <span class="property">max</span>: <span class="number">256</span> }),
      <span class="property">usernameLength</span>: <span class="function">lengthRule</span>({ <span class="property">min</span>: <span class="number">3</span>, <span class="property">max</span>: <span class="number">20</span> }),
      <span class="property">bioLength</span>: <span class="function">maxLengthRule</span>({ <span class="property">max</span>: <span class="number">100</span> }),
      <span class="property">ageRange</span>: <span class="function">rangeRule</span>({ <span class="property">min</span>: <span class="number">18</span>, <span class="property">max</span>: <span class="number">120</span> }),
      <span class="property">scoreMin</span>: <span class="function">minRule</span>({ <span class="property">min</span>: <span class="number">0</span> }),
      <span class="property">discountMax</span>: <span class="function">maxRule</span>({ <span class="property">max</span>: <span class="number">100</span> }),
      <span class="property">slugPattern</span>: <span class="function">regexRule</span>({ <span class="property">pattern</span>: <span class="regex">/^[a-z0-9]+(?:-[a-z0-9]+)*$/</span> }),
      <span class="property">passwordLength</span>: <span class="function">minLengthRule</span>({ <span class="property">min</span>: <span class="number">8</span> }),
      <span class="property">equals</span>: <span class="function">equalsRule</span>()
    }),
    <span class="function">providePliantMessages</span>({
      <span class="property">required</span>: <span class="string">"This field is required"</span>,
      <span class="property">email</span>: <span class="string">"Please enter a valid email"</span>,
      <span class="property">length</span>: (d) =&gt; <span class="string">\`Must be \${d.min}-\${d.max} characters\`</span>,
      <span class="property">maxLength</span>: (d) =&gt; <span class="string">\`Must be no more than \${d.max} characters\`</span>,
      <span class="property">range</span>: (d) =&gt; <span class="string">\`Must be between \${d.min} and \${d.max}\`</span>,
      <span class="property">min</span>: (d) =&gt; <span class="string">\`Must be at least \${d.min}\`</span>,
      <span class="property">max</span>: (d) =&gt; <span class="string">\`Must be no more than \${d.max}\`</span>,
      <span class="property">numeric</span>: <span class="string">"Only numeric digits allowed"</span>,
      <span class="property">regex</span>: <span class="string">"Invalid format"</span>,
      <span class="property">minLength</span>: (d) =&gt; <span class="string">\`Must be at least \${d.min} characters\`</span>,
      <span class="property">equals</span>: <span class="string">"Values must match"</span>
    })
  ]
});`;

  componentCodeHighlighted = `<span class="keyword">import</span> { <span class="function">pliant</span> } <span class="keyword">from</span> <span class="string">"@pliant/angular"</span>;

<span class="decorator">@Component</span>({ ... })
<span class="keyword">export</span> <span class="keyword">class</span> <span class="class">AppComponent</span> {
  <span class="property">form</span> = <span class="keyword">new</span> <span class="function">FormGroup</span>({
    <span class="property">email</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
      <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"required"</span>, <span class="string">"email"</span>])]
    }),
    <span class="property">username</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
      <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"usernameLength"</span>])]
    }),
    <span class="property">password</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
      <span class="property">validators</span>: [<span class="function">pliant</span>([<span class="string">"passwordLength"</span>])]
    }),
    <span class="property">confirm</span>: <span class="keyword">new</span> <span class="function">FormControl</span>(<span class="string">""</span>, {
      <span class="property">validators</span>: [<span class="function">pliant</span>([
        { <span class="property">name</span>: <span class="string">"equals"</span>, <span class="property">options</span>: { <span class="property">field</span>: <span class="string">"password"</span> } }
      ])]
    })
  });
}`;

  errorExampleHtml = this.syntaxHighlightJSON({
    email: {
      code: "email",
      message: "Please enter a valid email",
      actual: "invalid-email"
    },
    length: {
      code: "length",
      message: "Must be 3-20 characters",
      min: 3,
      max: 20,
      actual: 2
    }
  });

  constructor() {
    // Mark form as touched on init to show validation state
    setTimeout(() => this.form.markAllAsTouched(), 0);
  }
}

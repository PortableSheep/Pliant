import {
  addRules,
  createRegistry,
  evaluateRules,
  inheritRule,
  lengthRule,
  requiredRule,
  rangeRule,
  emailRule,
  numericRule,
  regexRule,
  minRule,
  maxRule,
  minLengthRule,
  equalsRule,
  applyMessages,
  createMessageResolver
} from "../../packages/pliant-core/dist-esm/pliant-core.bundle.js";

// Create the registry
const registry = createRegistry();

// Register all rules with meaningful names
addRules(registry, {
  // Base rules
  required: requiredRule(),
  email: emailRule(),
  numeric: numericRule(),
  length: lengthRule({ min: 0, max: 256 }),
  range: rangeRule({ min: 0, max: 100 }),

  // Inherited / specialized rules
  usernameLength: inheritRule("length", {
    options: { min: 3, max: 20 },
    message: "Username must be 3-20 characters"
  }),
  ageRange: rangeRule({ min: 18, max: 120, inclusive: true }),
  scoreMin: minRule({ min: 0, inclusive: true }),
  discountMax: maxRule({ max: 100, inclusive: true }),
  slugPattern: regexRule({ pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ }),
  passwordLength: minLengthRule({ min: 8 }),
  confirmMatch: equalsRule({ field: "password" })
});

// Message resolver with static and dynamic messages
const messageResolver = createMessageResolver({
  required: "This field is required",
  email: "Please enter a valid email address",
  numeric: "Only numeric digits allowed",
  length: (detail) => {
    if (detail.actual < detail.min) {
      return `Must be at least ${detail.min} characters (currently ${detail.actual})`;
    }
    return `Must be no more than ${detail.max} characters (currently ${detail.actual})`;
  },
  range: (detail) => `Must be between ${detail.min} and ${detail.max}`,
  min: (detail) => `Must be at least ${detail.min}`,
  max: (detail) => `Must be no more than ${detail.max}`,
  regex: "Invalid format (use lowercase letters, numbers, and hyphens)",
  equals: "Passwords do not match"
});

// Field configurations: input ID -> { rules, label }
const fieldConfig = {
  "demo-required": { rules: ["required"], label: "Required" },
  "demo-email": { rules: ["email"], label: "Email" },
  "demo-username": { rules: ["required", "usernameLength"], label: "Username" },
  "demo-age": { rules: ["ageRange"], label: "Age" },
  "demo-score": { rules: ["scoreMin"], label: "Score" },
  "demo-discount": { rules: ["discountMax"], label: "Discount" },
  "demo-zipcode": { rules: ["numeric"], label: "Numeric ID" },
  "demo-slug": { rules: ["slugPattern"], label: "Slug" },
  "demo-password": { rules: ["required", "passwordLength"], label: "Password" },
  "demo-confirm": { rules: [{ name: "confirmMatch", options: { field: "demo-password" } }], label: "Confirm" }
};

// Get all input elements
const inputs = {};
const errorEls = {};
Object.keys(fieldConfig).forEach((id) => {
  inputs[id] = document.querySelector(`#${id}`);
  errorEls[id] = document.querySelector(`#error-${id.replace("demo-", "")}`);
});

const summaryEl = document.querySelector("#validation-summary");
const liveErrorsEl = document.querySelector("#live-errors");
const setupCodeEl = document.querySelector("#setup-code");

// Display setup code
setupCodeEl.innerHTML = `<span class="keyword">import</span> {
  createRegistry,
  addRules,
  evaluateRules,
  inheritRule,
  requiredRule,
  emailRule,
  lengthRule,
  rangeRule,
  minRule,
  maxRule,
  numericRule,
  regexRule,
  minLengthRule,
  equalsRule,
  applyMessages,
  createMessageResolver
} <span class="keyword">from</span> <span class="string">"@pliant/core"</span>;

<span class="keyword">const</span> registry = <span class="function">createRegistry</span>();

<span class="function">addRules</span>(registry, {
  required: <span class="function">requiredRule</span>(),
  email: <span class="function">emailRule</span>(),
  numeric: <span class="function">numericRule</span>(),
  length: <span class="function">lengthRule</span>({ min: <span class="number">0</span>, max: <span class="number">256</span> }),

  <span class="comment">// Inherited rule with custom options</span>
  usernameLength: <span class="function">inheritRule</span>(<span class="string">"length"</span>, {
    options: { min: <span class="number">3</span>, max: <span class="number">20</span> },
    message: <span class="string">"Username must be 3-20 characters"</span>
  }),

  ageRange: <span class="function">rangeRule</span>({ min: <span class="number">18</span>, max: <span class="number">120</span> }),
  scoreMin: <span class="function">minRule</span>({ min: <span class="number">0</span> }),
  discountMax: <span class="function">maxRule</span>({ max: <span class="number">100</span> }),
  slugPattern: <span class="function">regexRule</span>({ pattern: <span class="string">/^[a-z0-9]+(?:-[a-z0-9]+)*$/</span> }),
  passwordLength: <span class="function">minLengthRule</span>({ min: <span class="number">8</span> }),
  confirmMatch: <span class="function">equalsRule</span>({ field: <span class="string">"password"</span> })
});

<span class="comment">// Validate a field</span>
<span class="keyword">const</span> errors = <span class="function">evaluateRules</span>(
  registry,
  value,
  { field: <span class="string">"username"</span>, data },
  [<span class="string">"required"</span>, <span class="string">"usernameLength"</span>]
);

<span class="comment">// Apply human-readable messages</span>
<span class="keyword">const</span> resolved = <span class="function">applyMessages</span>(errors, ctx, messageResolver);`;

// Validation function
const validate = () => {
  // Gather all form data
  const data = {};
  Object.keys(inputs).forEach((id) => {
    data[id] = inputs[id].value;
  });

  // Validate each field
  const allErrors = {};
  const allResolved = {};

  Object.keys(fieldConfig).forEach((id) => {
    const { rules } = fieldConfig[id];
    const ctx = { field: id, data };
    const errors = evaluateRules(registry, data[id], ctx, rules);
    const resolved = applyMessages(errors, ctx, messageResolver);

    allErrors[id] = errors;
    allResolved[id] = resolved;

    // Update input styling
    const input = inputs[id];
    const errorEl = errorEls[id];

    if (resolved) {
      input.classList.add("invalid");
      input.classList.remove("valid");
      const firstError = Object.values(resolved)[0];
      if (errorEl) {
        errorEl.textContent = firstError.message || firstError.code;
        errorEl.classList.add("visible");
      }
    } else if (data[id]) {
      input.classList.remove("invalid");
      input.classList.add("valid");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.remove("visible");
      }
    } else {
      input.classList.remove("invalid", "valid");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.remove("visible");
      }
    }
  });

  // Update summary
  const invalidCount = Object.values(allResolved).filter(Boolean).length;
  const validCount = Object.keys(fieldConfig).length - invalidCount;

  summaryEl.innerHTML = `
    <div class="summary-header">
      <span class="summary-title">Validation Summary</span>
      <span class="status-badge ${invalidCount === 0 ? "valid" : "invalid"}">
        ${invalidCount === 0 ? "✓ All Valid" : `${invalidCount} Invalid`}
      </span>
    </div>
    ${Object.keys(fieldConfig)
      .map((id) => {
        const { label } = fieldConfig[id];
        const resolved = allResolved[id];
        const isValid = !resolved;
        const message = resolved
          ? Object.values(resolved)[0]?.message || Object.values(resolved)[0]?.code
          : "Valid";
        return `
          <div class="field-status">
            <span class="field-status-icon ${isValid ? "valid" : "invalid"}">${isValid ? "✓" : "✕"}</span>
            <span class="field-status-name">${label}</span>
            <span class="field-status-message">${message}</span>
          </div>
        `;
      })
      .join("")}
  `;

  // Update live JSON output with syntax highlighting
  const errorsForDisplay = {};
  Object.keys(allErrors).forEach((id) => {
    if (allErrors[id]) {
      errorsForDisplay[fieldConfig[id].label] = allErrors[id];
    }
  });

  if (Object.keys(errorsForDisplay).length > 0) {
    liveErrorsEl.innerHTML = syntaxHighlightJSON(errorsForDisplay);
  } else {
    liveErrorsEl.innerHTML = '<span class="json-comment">// No errors – all fields are valid!</span>';
  }

  // Update submit button state
  submitBtn.disabled = invalidCount > 0;

  return { invalidCount, allResolved };
};

// JSON syntax highlighting
const syntaxHighlightJSON = (obj) => {
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
};

// Submit button handling
const submitBtn = document.querySelector("#submit-btn");
const submitStatus = document.querySelector("#submit-status");

submitBtn.addEventListener("click", () => {
  // Touch all fields to show validation
  Object.values(inputs).forEach((input) => {
    if (input) {
      input.classList.add("touched");
    }
  });

  const { invalidCount, allResolved } = validate();

  if (invalidCount === 0) {
    submitStatus.textContent = "✓ Form submitted successfully!";
    submitStatus.className = "submit-status visible success";
    
    // Simulate form submission
    setTimeout(() => {
      submitStatus.className = "submit-status";
    }, 3000);
  } else {
    submitStatus.textContent = `✕ Please fix ${invalidCount} error${invalidCount > 1 ? "s" : ""} before submitting`;
    submitStatus.className = "submit-status visible error";

    // Focus the first invalid field
    const firstInvalidId = Object.keys(allResolved).find((id) => allResolved[id]);
    if (firstInvalidId && inputs[firstInvalidId]) {
      inputs[firstInvalidId].focus();
    }
  }
});

// Bind input events
Object.values(inputs).forEach((input) => {
  if (input) {
    input.addEventListener("input", validate);
  }
});

// Initial validation
validate();

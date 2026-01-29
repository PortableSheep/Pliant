---
layout: home

hero:
  name: "Pliant"
  text: "Modern Validation Library"
  tagline: Framework-agnostic validation with structured errors, rule inheritance, and TypeScript-first design
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourname/pliant

features:
  - icon: 🎯
    title: Framework Agnostic
    details: Use @pliant/core anywhere - Node.js, browsers, React, Vue, Svelte. Add @pliant/angular for seamless Angular integration.
  - icon: 📦
    title: Structured Errors
    details: Every validation error includes a code, message, and contextual details. Perfect for i18n and custom error handling.
  - icon: 🔗
    title: Rule Inheritance
    details: Create specialized rules that extend existing ones. Build "usernameLength" from "length" with custom options and messages.
  - icon: ⚡
    title: 11 Built-in Rules
    details: Ships with required, email, numeric, length, minLength, maxLength, range, min, max, regex, and equals rules.
  - icon: 🔌
    title: Extensible
    details: Create custom sync or async rules with full TypeScript support. Rules are pure functions - easy to test and compose.
  - icon: 💬
    title: Message Resolution
    details: Define messages as static strings or dynamic functions. Supports template literals with error details for rich messages.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --vp-home-hero-image-background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --vp-home-hero-image-filter: blur(44px);
}

.VPHero .name {
  font-size: 4rem !important;
}
</style>

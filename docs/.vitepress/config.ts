import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Pliant",
  description: "A modern, framework-agnostic validation library with structured errors and rule inheritance",
  
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', rel: 'stylesheet' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Core API', link: '/core/' },
      { text: 'Angular', link: '/angular/' },
      { text: 'Rules', link: '/rules/' },
      {
        text: 'Examples',
        items: [
          { text: 'Core Example', link: '/examples/core' },
          { text: 'Angular Example', link: '/examples/angular' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Pliant?', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Why Pliant?', link: '/guide/why-pliant' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Rules & Registry', link: '/guide/rules-registry' },
            { text: 'Rule Inheritance', link: '/guide/rule-inheritance' },
            { text: 'Messages', link: '/guide/messages' },
            { text: 'Error Structure', link: '/guide/error-structure' }
          ]
        }
      ],
      '/core/': [
        {
          text: '@pliant/core',
          items: [
            { text: 'Overview', link: '/core/' },
            { text: 'createRegistry', link: '/core/create-registry' },
            { text: 'addRules', link: '/core/add-rules' },
            { text: 'evaluateRules', link: '/core/evaluate-rules' },
            { text: 'inheritRule', link: '/core/inherit-rule' },
            { text: 'Messages', link: '/core/messages' },
            { text: 'TypeScript Types', link: '/core/types' }
          ]
        }
      ],
      '/angular/': [
        {
          text: '@pliant/angular',
          items: [
            { text: 'Overview', link: '/angular/' },
            { text: 'Setup', link: '/angular/setup' },
            { text: 'pliant() Validator', link: '/angular/pliant-validator' }
          ]
        }
      ],
      '/rules/': [
        {
          text: 'Built-in Rules',
          items: [
            { text: 'Overview', link: '/rules/' },
            { text: 'required', link: '/rules/required' },
            { text: 'email', link: '/rules/email' },
            { text: 'numeric', link: '/rules/numeric' },
            { text: 'length', link: '/rules/length' },
            { text: 'minLength', link: '/rules/minLength' },
            { text: 'maxLength', link: '/rules/maxLength' },
            { text: 'range', link: '/rules/range' },
            { text: 'min', link: '/rules/min' },
            { text: 'max', link: '/rules/max' },
            { text: 'regex', link: '/rules/regex' },
            { text: 'equals', link: '/rules/equals' }
          ]
        },
        {
          text: 'Custom Rules',
          items: [
            { text: 'Creating Rules', link: '/rules/custom' },
            { text: 'Async Rules', link: '/rules/async' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourname/pliant' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present'
    },

    search: {
      provider: 'local'
    }
  }
})

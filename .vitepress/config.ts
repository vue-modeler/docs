import { defineConfig } from 'vitepress'
import { fmTitlePlugin } from 'vitepress-plugin-frontmatter'

// Для репозитория vue-modeler.github.io используйте base: '/'
// Для репозитория docs используйте base: '/docs/'
const base = '/' // Репозиторий: https://github.com/vue-modeler/vue-modeler.github.io.git

export default defineConfig({
  title: 'Vue Modeler',
  description: 'OOP for state management in Vue',

  base,

  head: [
    ['link', { rel: 'icon', href: '/logo.webp', type: 'image/webp' }],
    ['script', { src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "75dc58aef7764625995d8740de68d04e"}', defer: '' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Vue Modeler',
      description: 'OOP for state management in Vue',
      themeConfig: {
        nav: [
          { text: 'Introduction', link: '/introduction/', activeMatch: '/introduction/' },
          { text: 'Guide', link: '/guides/', activeMatch: '/guides/' },
          { text: 'API', link: '/api/', activeMatch: '/api/' },
          { text: 'Advanced', link: '/advanced/testing', activeMatch: '/advanced/' },
        ],
        sidebar: {
          '/api/': [
            {
              text: 'API',
              items: [
                { text: 'Overview', link: '/api/' },
                { text: 'ProtoModel', link: '/api/proto-model' },
                { text: 'Action', link: '/api/action' },
                { text: 'ActionError', link: '/api/action-error' },
                { text: 'Internal Errors', link: '/api/action-internal-errors' },
                { text: 'Interfaces and Types', link: '/api/interfaces' },
              ]
            },
          ],
          '/api': [
            {
              text: 'API',
              items: [
                { text: 'Overview', link: '/api/' },
                { text: 'ProtoModel', link: '/api/proto-model' },
                { text: 'Action', link: '/api/action' },
                { text: 'ActionError', link: '/api/action-error' },
                { text: 'Internal Errors', link: '/api/action-internal-errors' },
                { text: 'Interfaces and Types', link: '/api/interfaces' },
              ]
            },
          ],
          '/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is vue-modeler', link: '/introduction/' },
                { text: 'Installation', link: '/introduction/installation' },
                { text: 'Getting Started', link: '/introduction/getting-started' },
              ]
            },
            {
              text: 'Guides',
              items: [
                { text: 'Dependency Container', link: '/guides/' },
                { text: 'Model', link: '/guides/model' },
                { text: 'Action', link: '/guides/action' },
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Testing', link: '/advanced/testing' },
                { text: 'Working with SSR', link: '/advanced/ssr' },
                { text: 'Predefined Hooks', link: '/advanced/predefined-hooks' },
                { text: 'Argument Validation', link: '/advanced/args-validation' },
              ]
            },
          ],
        },
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      title: 'Vue Modeler',
      description: 'ООП для управления состоянием во Vue',
      themeConfig: {
        nav: [
          { text: 'Введение', link: '/ru/introduction/', activeMatch: '/ru/introduction/' },
          { text: 'Руководство', link: '/ru/guides/', activeMatch: '/ru/guides/' },
          { text: 'API', link: '/ru/api/', activeMatch: '/ru/api/' },
          { text: 'Продвинутые темы', link: '/ru/advanced/testing', activeMatch: '/ru/advanced/' },
        ],
        sidebar: {
          '/ru/api/': [
            {
              text: 'API',
              items: [
                { text: 'Обзор', link: '/ru/api/' },
                { text: 'ProtoModel', link: '/ru/api/proto-model' },
                { text: 'Action', link: '/ru/api/action' },
                { text: 'ActionError', link: '/ru/api/action-error' },
                { text: 'Внутренние ошибки', link: '/ru/api/action-internal-errors' },
                { text: 'Интерфейсы и типы', link: '/ru/api/interfaces' },
              ]
            },
          ],
          '/ru/api': [
            {
              text: 'API',
              items: [
                { text: 'Обзор', link: '/ru/api/' },
                { text: 'ProtoModel', link: '/ru/api/proto-model' },
                { text: 'Action', link: '/ru/api/action' },
                { text: 'ActionError', link: '/ru/api/action-error' },
                { text: 'Внутренние ошибки', link: '/ru/api/action-internal-errors' },
                { text: 'Интерфейсы и типы', link: '/ru/api/interfaces' },
              ]
            },
          ],
          '/ru/': [
            {
              text: 'Введение',
              items: [
                { text: 'Что такое vue-modeler', link: '/ru/introduction/' },
                { text: 'Установка', link: '/ru/introduction/installation' },
                { text: 'Быстрый старт', link: '/ru/introduction/getting-started' },
              ]
            },
            {
              text: 'Руководства',
              items: [
                { text: 'Контейнер зависимостей', link: '/ru/guides/' },
                { text: 'Модель', link: '/ru/guides/model' },
                { text: 'Действие', link: '/ru/guides/action' },
              ]
            },
            {
              text: 'Продвинутые темы',
              items: [
                { text: 'Тестирование', link: '/ru/advanced/testing' },
                { text: 'Работа с SSR', link: '/ru/advanced/ssr' },
                { text: 'Встроенные хуки', link: '/ru/advanced/predefined-hooks' },
                { text: 'Валидация аргументов', link: '/ru/advanced/args-validation' },
              ]
            },
          ],
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.webp',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vue-modeler' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Alexander Bratko'
    },
  },

  markdown: {
    lineNumbers: true,
    config(md) {
      md.use(fmTitlePlugin)
    }
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        binaryInterval: 3000,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.vite/**',
          '**/.vitepress/cache/**',
          '**/public/**',
          '**/coverage/**',
          '**/test/**',
          '**/tests/**',
          '**/__tests__/**',
          '**/*.spec.ts',
          '**/*.test.ts',
          '**/log/**',
          '**/logs/**',
          '**/tmp/**',
          '**/temp/**'
        ]
      },
      fs: {
        allow: [
          '..',
          '/home/abratko/webprojects/vue-modeler'
        ]
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  }
})

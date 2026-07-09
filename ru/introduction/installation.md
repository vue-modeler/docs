---
title: Установка
description: Инструкции по установке и настройке Vue Modeler
---

## Ставим пакеты

::: code-group

```bash [Vue 3]
npm install @vue-modeler/di@^3.0.0 @vue-modeler/model
```

```bash [Vue 2]
npm install @vue-modeler/di@^2.0.0 @vue-modeler/model
```

:::

**[@vue-modeler/model](https://www.npmjs.com/package/@vue-modeler/model)** не требует дополнительных настроек.
**[@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di)** нужно подключить в приложение.

## Подключаем контейнер

### Нативный Vue проект

::: code-group

```js [Vue 3]
import { createApp } from 'vue'
import { vueModelerDc, Container } from '@vue-modeler/di'

const dc = new Container()
const app = createApp(App)
app.use(vueModelerDc, { dc })
app.mount('#app')
```

```js [Vue 2]
import Vue from 'vue'
import { vueModelerDc, Container } from '@vue-modeler/di'

const dc = new Container()
Vue.use(vueModelerDc)
new Vue({
  vueModelerDc: { dc },
  // your app configuration
}).$mount('#app')
```

:::

::: tip
Передавать контейнер необязательно. Если подключить плагин без него — `app.use(vueModelerDc)` во Vue 3 или `Vue.use(vueModelerDc)` во Vue 2 — плагин создаст контейнер автоматически.
:::

### Nuxt проект

Просто создайте плагин для Nuxt в папке `plugins`

```typescript
// plugins/vue-modeler-dc.ts
import { vueModelerDc, Container } from '@vue-modeler/di'

export default defineNuxtPlugin((nuxtApp) => {
  const dc = new Container()
  nuxtApp.vueApp.use(vueModelerDc, { dc })
})
```

Всё готово для начала работы!

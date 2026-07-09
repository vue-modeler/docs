---
title: Installation
description: How to install and configure Vue Modeler
---

## Install packages

::: code-group

```bash [Vue 3]
npm install @vue-modeler/di@^3.0.0 @vue-modeler/model
```

```bash [Vue 2]
npm install @vue-modeler/di@^2.0.0 @vue-modeler/model
```

:::

**[@vue-modeler/model](https://www.npmjs.com/package/@vue-modeler/model)** requires no extra configuration.
**[@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di)** must be registered in the app.

## Register the container

### Plain Vue project

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
Passing a container is optional. If you register the plugin without it — `app.use(vueModelerDc)` in Vue 3 or `Vue.use(vueModelerDc)` in Vue 2 — the plugin creates a container automatically.
:::

### Nuxt project

Create a Nuxt plugin in the `plugins` folder:

```typescript
// plugins/vue-modeler-dc.ts
import { vueModelerDc, Container } from '@vue-modeler/di'

export default defineNuxtPlugin((nuxtApp) => {
  const dc = new Container()
  nuxtApp.vueApp.use(vueModelerDc, { dc })
})
```

You're ready to go!

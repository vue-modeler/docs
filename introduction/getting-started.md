---
title: Getting Started
description: Step-by-step guide to creating your first model with Vue Modeler
---

**For a quick start we'll build a simple task:** a counter that increments and decrements when clicking `increment +` and `decrement -`. Changing the counter will be async actions. We'll make them take 2 seconds. While an action runs, the buttons will be disabled. We'll also add reset to 0 on `reset` click.

That's enough to show the features and advantages over other libraries.

## 1. Define the model class

`Counter` is a standard class extending `ProtoModel`, with property `_count` and methods `increment`, `decrement`, and `reset`. Mark them with the `@action` decorator so they become async actions and we can use them as reactive objects.

Extending `ProtoModel` is required; it provides internal helpers. More [here](/guides/model).

The API service dependency is passed in the constructor. We define an interface for it.

```typescript
// getting-started/counter.ts
import { ProtoModel, action } from '@vue-modeler/model'

interface ApiService {
  inc: (currentCount: number) => Promise<number>
  dec: (currentCount: number) => Promise<number>
}

export class Counter extends ProtoModel {
  protected _count = 0

  constructor(
    private apiService: ApiService,
  ) {
    super()
  }

  get count(): number {
    return this._count
  }

  @action async increment(): Promise<void> {
    this._count = await this.apiService.inc(this._count)
  }

  @action async decrement(): Promise<void> {
    this._count = await this.apiService.dec(this._count)
  }

  @action async reset(): Promise<void> {
    this._count = 0
  }
}
```

## 2. Create an API service stub

We'll use a simple stub to simulate slow async requests.
The API methods fail randomly. This is to show error handling in the component.

Errors can also be handled inside model actions when needed by business logic. Here we don't, so we don't catch them.

```typescript
// getting-started/api-service.ts
const timeout = 2000

export const apiService = {
  inc: async (currentCount: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (Math.random() < 0.5) {
        reject(new Error('increment failed'))

        return
      }

      setTimeout(
        () => resolve(currentCount + 1),
        timeout,
      )
    })
  },
  dec: async (currentCount: number): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (Math.random() > 0.5) {
        reject(new Error('decrement failed'))

        return
      }

      setTimeout(
        () => resolve(currentCount - 1),
        timeout,
      )
    })
  }
}
```

## 3. Create the model and register it in the dependency container

Every model class has a static `model` method that creates the model.

To use the model in a component, register it in the dependency container. The `provider` function creates a model provider.

The provider creates the model on first use and returns the same instance on later calls. More [here](/guides/).

```typescript
// getting-started/di.ts
import { provider } from '@vue-modeler/di'
import { Counter } from './counter'
import { apiService } from './api-service'

export const useCounter = provider(() => Counter.model(apiService))
```

## 4. Use the model in a Vue component

Get the model from the container the usual way: `const counter = useCounter`. It works like a normal composable.

The component stays minimal and only handles display. All business logic is in the model. Action state and errors come from the actions themselves.

```vue
// getting-started/app-counter.vue

<script setup lang="ts">
import { useCounter } from './di'

const counter = useCounter()

const isBusy = computed(() =>
  counter.increment.isPending
  || counter.decrement.isPending
  || counter.reset.isPending
)

const error = computed(() =>
  counter.increment.error?.cause
  || counter.decrement.error?.cause
  || counter.reset.error?.cause
)
</script>

<template>
  <div>
    <div v-if="error">
      {{ error }}
    </div>
    <div v-else>
      Current value: {{ counter.count }}
    </div>

    <button
      :disabled="isBusy"
      @click="counter.increment.exec()"
    >
      {{ counter.increment.isPending ? 'increment ...' : 'increment +' }}
    </button>

    <button
      :disabled="isBusy"
      @click="counter.decrement.exec()"
    >
      {{ counter.decrement.isPending ? 'decrement ...' : 'decrement -' }}
    </button>

    <button
      :disabled="isBusy"
      @click="counter.reset.exec()"
    >
      {{ counter.reset.isPending ? '...' : 'reset' }}
    </button>
  </div>
</template>
```

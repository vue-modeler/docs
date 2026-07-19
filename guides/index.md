---
title: Dependency Container
description: Managing dependencies and object lifecycle in Vue applications
---

**[@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di)** is a dependency container based on [shared composable](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0041-reactivity-effect-scope.md#example-a-shared-composable).

The container solves the problem of managing model and service lifecycle:

- Simplifies sharing models and services across components
- Separates business logic from presentation
- Enables MVVM, DDD, SOLID principles
- Can be used as a [service locator](#resolving-outside-setup) via `dc.resolve()` outside `setup`

## Main features

- ⚡ **Lazy loading**: creates dependencies only when needed
- 🗑️ **Auto cleanup**: removes unused dependencies
- 🔧 **Destructor support**: calls `destructor` on cleanup
- 💾 **Persistent instances**: for long-lived services
- 🧭 **Service locator**: resolve dependencies at runtime through the container

::: tip
The dependency container stores dependencies but does NOT support autowire. You wire dependencies in your own module or layer.
:::

## How it works

The container follows "create on demand, remove when unused":

1. **Register factory** — you register a factory for the instance and get a shared composable
2. **Create instance** — the instance is created only on first access
3. **Reuse** — subsequent access returns the same instance
4. **Reference tracking** — the container counts how many components use the instance
5. **Cleanup** — when the count reaches 0, the instance is removed

## Registering a factory

`provider` registers a dependency factory and creates a shared composable for use in components.

The factory is a simple function that can return any synchronous value, except `null`, `undefined`, or a `Promise` (see [Factories must be synchronous](#factories-must-be-synchronous)).

The container stores whatever the factory returns. It does nothing else and does not inject dependencies.

```typescript
import { provider } from '@vue-modeler/di';

const useDependency = provider(() => {
  // your instance factory
  return {
    // instance with methods and data
  };
});


// this works too
const useSymbol = provider(() => new Symbol('dependency'));
const useNumber = provider(() => 10);
const useTrue = provider(() => true);

// pass dependencies into the constructor
const useSomeModel = provider(() => new SomeModel(
  useDependency(),
  useSymbol(),
  useNumber(),
  useTrue()
));
```

## Using in components

Example of using a provider in a component template:

```html
<template>
  <div>{{ model.state }}</div>
</template>

<script setup lang="ts">
import { useDependency } from '@/providers/myDependency';

const model = useDependency(); // get the instance
</script>
```

## Persistent instances

Sometimes you need an instance that stays in memory after use, e.g. app-level services, caches, or state managers.

Pass `persistentInstance: true` to `provider`:

```typescript
const usePersistentService = provider(
  () => new MyService(),
  { persistentInstance: true }
);
```

Persistent instances:

- Remain in the container even after the scope is released
- Keep their state across component remounts
- Nested providers inside a persistent provider become persistent automatically
- Useful for app-level services, caches, and state managers

Example with nested providers:

```typescript
// nested provider becomes persistent with the parent
const useNestedService = provider(() => new NestedService());

const usePersistentService = provider(
  () => new MainService(useNestedService()),
  { persistentInstance: true }
);
```

::: warning
On the client, use persistent instances with care — they are not removed automatically.
:::

For SSR, persistent instances are safe: each request gets a new container instance, and the previous one is discarded with its contents.

## Accessing the container in a factory

The factory receives an object whose `dc` property is the active container. Use it when an instance needs to resolve other dependencies at runtime (outside `setup`):

```typescript
import { provider, type DependencyContainer } from '@vue-modeler/di';

const useApi = provider(({ dc }) => new ApiClient(dc));
```

`dc` is the public `DependencyContainer`. Nested providers called synchronously inside the factory inherit the same container automatically.

## Resolving outside setup

`useDependency()` may only be called synchronously in a component `setup` or inside another provider factory. For runtime code — event handlers, router hooks, `watch`, code after `await`, tests, or SSR — resolve through a container reference instead:

```typescript
const model = dc.resolve(useDependency);
```

`resolve()` returns (or creates) the instance in that container. Unlike `useDependency()` in `setup`, it does not bind the instance to a Vue scope, so the instance lives as long as the container.

## Redefining a factory

Each provider exposes `redefine(factory)` to swap the factory before the first resolve — useful for tests and SSR mocks. The replacement receives the same `{ dc }` argument plus `prevFactory`, so you can wrap the previous implementation:

```typescript
const useService = provider(({ dc }) => new RealService(dc));

useService.redefine(({ dc, prevFactory }) => {
  const previous = prevFactory?.({ dc });
  return new MockService(previous);
});
```

Redefining after an instance already exists in the target container throws `Provider was redefined after instance creation`. Resolve mocks from a dedicated container to keep them isolated.

## Factories must be synchronous

A factory must run to completion synchronously and return the instance directly — never a `Promise`. `async` factories, `await` in the factory body, or returning a `Promise` are not supported and throw on registration. Do async work on the created instance, not in the factory.

```typescript
// Not allowed
const useModel = provider(async ({ dc }) => new MyModel(dc));

// OK — async work lives on the instance
const useModel = provider(({ dc }) => new MyModel(dc));
```

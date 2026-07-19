---
title: Model
description: Guide to creating and using models in Vue Modeler
---

The model combines state (data) and behavior (actions) into a single reactive object that manages its effects and cleans them up on destruction.

::: tip
**Model = data + actions + reactivity + effect management**
:::

## Core concepts

Vue Modeler has a clear hierarchy of concepts:

**ProtoModel** is the abstract base class that provides the foundation for all models. It:

- creates an `EffectScope` per model;
- turns methods decorated with `@action` into actions and exposes them;
- provides the unified model constructor — static method `model`;
- has built-in `watch` and `computed` that register effects in the model's EffectScope;
- cleans up effects when the model is destroyed.

**Model class** is a normal class extending `ProtoModel` that defines a concrete model's structure and behavior.

The model class defines:

- **State shape**: what data the model holds;
- **Actions**: async methods marked with `@action` that change model state;
- **Business logic**: rules and constraints for the data;
- **Watchers and computed**: derived values from state.

**Model** is a shallow reactive object with its own EffectScope, created from a class instance, where actions are executable objects with their own reactive state.

## Constructor and creating a model

Define a constructor and call the static `model` method to create a model.

```typescript
// counter.ts
import { ProtoModel, action } from '@vue-modeler/model'

export class Counter extends ProtoModel {
  ...
  constructor(
    private apiService: SomeApiService,
  ) {
    super()
  }
  ...
}

// This is a model
const counterModel = Counter.model(new ApiService())

// This is a class instance. NOT a model.
const counter = new Counter(new ApiService())
```

::: tip
If you call the constructor with `new`, you get a class instance. A class instance is not a model: it is not reactive and actions are not objects.
:::

The `model` method is the universal named constructor; it is defined on `ProtoModel` and exists on all model classes. It mirrors the class constructor signature, so TypeScript type-checking works.

Under the hood, `model` creates a class instance and applies the static `createModel` method. `createModel` is the model factory: it turns the instance into a `shallowReactive` object and wraps it in a proxy that exposes actions as objects.

For special cases you can add your own static factory. To have it return a model, create a class instance and call the static `createModel` on it.

```typescript
// counter.ts
import { ProtoModel, action } from '@vue-modeler/model'

export class Counter extends ProtoModel {
  protected _count = 0

  static customFactoryModel(startValue: number, apiService: SomeApiService): Model<Counter> {
    const counter = new Counter(apiService)
    counter._count = startValue
    return Counter.createModel(counter)
  }
  ...
}
```

## Destroying the model

All models have `destructor` (defined on `ProtoModel`). It removes all effects and the EffectScope. Call it when the model is no longer needed. If you use [@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di), the container will call `destructor` and remove the model when it is unused.

Override `destructor` if you need extra cleanup.

::: warning
Always call `super.destructor()`, or you will leak memory.
:::

## Properties

Property values are the model state; there is no separate state store.

Public and protected properties are reactive automatically after the model is created; you don't need Vue Composition API. That's because the model is a shallow reactive object. Private properties are not reactive.

Use Vue Composition API explicitly when:

- you need to watch them inside the model;
- you need deep reactivity for complex objects;
- you need a private property to be reactive.

Prefer protected properties and expose them via getters to avoid direct mutation and to encapsulate state.

## Actions and methods

**Action** is an object but is declared as an async method with `@action` that changes state and returns no data.

See [Action](/guides/action) for using actions inside and outside classes.

## Watchers

The `watch` method creates a watcher — it wraps Vue's composition API, registers the effect in the model's effect scope, stores the stop handle and returns it. That stop handle is run when the model is destroyed in the destructor.

::: warning
Do not use `watch` or `computed` directly from Vue's composition API. That leads to memory leaks.
:::

You can watch: reactive dependencies, properties, and dynamic models. For reactive dependencies or properties, call `watch` in the constructor. For properties, note that in the constructor `this` is not yet shallow reactive, so use ref/computed if you need to watch them.

For **dynamic models** (e.g. a repository that loads DTOs and turns them into models), call `watch` after creating the model, store the stop handle, and call it when removing the model from the repository. Otherwise the watcher will keep a reference and the model won't be garbage-collected.

## Inheritance, polymorphism

The model class is a normal class; standard OOP applies. Parent actions work in child classes.

## Dependencies

Dependencies are passed as constructor arguments. They can be: API services, DB clients, router, UI settings, other models or stores (Pinia, Vuex, any reactive object). The model does not inject dependencies; the container does.

## API reference

See [Model API](/api/proto-model) for full method and property reference.

---
title: Introduction
description: Overview of Vue Modeler architecture and core concepts
outline: deep
---

**Vue Modeler** is a comprehensive solution for state management in Vue.js applications, consisting of two complementary libraries:

- **[@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di)** — dependency container.
- **[@vue-modeler/model](https://www.npmjs.com/package/@vue-modeler/model)** — library for creating models (reactive objects with state)

## Key concepts

- **Model instead of store**. No global state store.
  No store — no problem. State is encapsulated in the model and is reactive. Outside the model it is read-only and observable. Destroying the model destroys the state.

- **Action — object with reactive state and behavior**. Inside the model class, Action is an async method that changes state; outside (in components and other models) — a reactive object with state and behavior.

- **Dependencies via injection and dependency container**

  - The model receives dependencies as constructor arguments. No direct imports from other modules. This makes it easy to extract related models into separate modules and reuse in other projects.

  - No need to think about how to create, get, or remove a model after use — the container handles it.

## Key features

- **OOP-based**.
  Model is defined as a standard class.
  Inheritance, encapsulation, polymorphism, destructor are available by default.

- **Type safety preserved**.
  All autocomplete hints work both inside and outside the class context.

- **Vue reactivity**.
  Everything works on top of Vue reactivity. No need to learn extra APIs or approaches for reactive objects.

- **Easy testing**.
  [@vue-modeler/model](https://www.npmjs.com/package/@vue-modeler/model) lets you write less code, which means fewer tests. Testing models is the same as testing plain class instances.

---

## Why it was created

### Boilerplate in actions

**Problem:**
  Actions are often accompanied by repetitive code to track execution state
  via extra variables: `isLoading`, `isPending`.
  This code adds no business value but bloats the codebase.

**Solution:**
  Action is an object with reactive properties reflecting its execution status:
  `ready`, `pending`, `lock`, `abort`, `error`. No extra code needed.

### Cancelling or locking an action

**Problem:** Cancelling or locking an action is uncommon but necessary.
Everyone solves it differently, but the pattern is the same.
Different implementations of the same pattern make maintenance and reuse harder.

**Solution:** Action provides `lock` and `abort` methods for locking and cancelling.
No extra code to write or maintain.

### Exception handling

**Problem:** Exception handling is an extra source of issues:

- developers forget about it;
- each developer handles it differently;
- guidelines don't guarantee exceptions are handled correctly;
- handling always needs careful code review.

**Solution:** Action catches exceptions, stores them as part of state
and provides a single interface for handling. Developers can't handle them differently.

### Outdated patterns

**Problem:** Pinia uses an outdated factory function pattern for stores.
That approach brings extra patterns to emulate inheritance and polymorphism.

**Solution:** Class and OOP support out of the box.

### Too much reactivity

**Problem:** A Pinia store is an object with reactive properties.
But inside the factory function those are reactive variables created with Vue's Reactivity API.
You get double reactivity and different interfaces for the same data.

**Solution:** Models are shallow reactive objects out of the box.
Public and protected properties are reactive both outside and inside
without explicitly using Vue's reactivity API.

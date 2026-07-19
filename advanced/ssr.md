---
title: Working with SSR
description: Server-Side Rendering with the dependency container
outline: deep
---

::: tip
[@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di) ships a ready `SsrStateService` through the [`useSsrState`](/advanced/predefined-hooks#usessrstate) hook, including a full isomorphic model example.
:::

[@vue-modeler/model](https://www.npmjs.com/package/@vue-modeler/model) has no built-in state store. You are responsible for serializing and deserializing state.

Implementation depends on your stack. The idea:

1. Create a service that:
   - On the server: accepts a serialization function
   - On the client: returns data by key
2. The model:
   - Takes this service as a dependency
   - On the server: registers a serialization function with it
   - On the client: reads data by key and initializes state

The model only reads what it previously wrote via the serializer. You have full control over format and content.

The model does not know how the serialization service sends data from server to client.

## Example

Define an isomorphic model that uses an `SsrStateService` with `extractState(key)` and `addSerializer(fn)`. In the constructor: on the client, restore state with `extractState('myModelState')`; on the server, register a serializer that returns `{ extractionKey: 'myModelState', value: this._state.value }`. Use `shallowRef` for state that is serialized.

In the component, use `onServerPrefetch` to wait for e.g. `model.init.promise` so the server waits for data before rendering.

Hydration depends on your setup. If using [@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di), you might get the SSR state service from the container and call `injectState(ctx.state)` so state is written to a global that the client can read.

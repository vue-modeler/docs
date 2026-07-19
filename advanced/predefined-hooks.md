---
title: Predefined hooks
description: Built-in hooks available inside provider factories
---

The container ships with a set of predefined hooks you can call inside a provider factory.

## `useVueApp`

Inside a factory you can get the current Vue app instance with `useVueApp()`:

```typescript
import { provider, useVueApp } from '@vue-modeler/di';

const useConfig = provider(() => {
  const app = useVueApp();
  return new Config(app);
});
```

## `useSsrState`

`useSsrState` is a predefined provider that resolves a shared `SsrStateService`. Use it to collect state on the server and restore it on the client. The service automatically detects the environment and reads the initial state from `__INITIAL_STATE__` on the client.

An isomorphic model takes the service in its constructor: on the client it restores state with `extractState`, and on the server it registers a serializer with `addSerializer`.

```typescript
import { shallowRef, type ShallowRef } from 'vue';
import type { SsrStateService } from '@vue-modeler/di';

export class MyIsomorphicModel {
  protected _state: ShallowRef<Record<string, unknown>>;

  constructor(
    private ssrState: SsrStateService,
  ) {
    // Client: restore the state serialized on the server
    const stateFromServer = this.ssrState.extractState('myModelState') as
      | Record<string, unknown>
      | undefined;
    this._state = shallowRef(stateFromServer ?? {});

    // Server: register a serializer, called during hydration
    if (this.ssrState.isServer) {
      this.ssrState.addSerializer(() => ({
        extractionKey: 'myModelState',
        value: this._state.value,
      }));
    }
  }

  get state(): Readonly<Record<string, unknown>> {
    return this._state.value;
  }
}
```

Resolve the service inside a factory and pass it to the model:

```typescript
import { provider, useSsrState } from '@vue-modeler/di';

const useMyModel = provider(() => new MyIsomorphicModel(useSsrState()));
```

The service exposes:

| Member | Description |
|--------|-------------|
| `isServer` | `true` on the server, `false` in the browser. |
| `extractState(key)` | Client: returns the value serialized on the server for `key`. |
| `addSerializer(fn)` | Server: registers a serializer `() => ({ extractionKey, value })`. Returns the same `fn` so you can remove it later. |
| `removeSerializer(fn)` | Server: unregisters a previously added serializer. |
| `injectState(target)` | Server: writes the serialized state into `target` so it can be sent to the client. |

Outside `setup` (for example, in a server entry file), don't call `useSsrState()` directly — resolve it through the container instead:

```typescript
import { useSsrState } from '@vue-modeler/di';

function ssrHydration(ctx: Context): void {
  const ssrStateService = app.$vueModelerDc.resolve(useSsrState);
  ssrStateService.injectState(ctx.state);
}
```

See [Working with SSR](/advanced/ssr) for the full server-to-client flow.

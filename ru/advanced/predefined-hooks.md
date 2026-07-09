---
title: Встроенные хуки
description: Встроенные хуки, доступные внутри фабрик провайдеров
---

Контейнер предоставляет набор встроенных хуков, которые можно вызывать внутри фабрики провайдера.

## `useVueApp`

Внутри фабрики можно получить текущий экземпляр Vue-приложения с помощью `useVueApp()`:

```typescript
import { provider, useVueApp } from '@vue-modeler/di';

const useConfig = provider(() => {
  const app = useVueApp();
  return new Config(app);
});
```

## `useSsrState`

`useSsrState` — встроенный провайдер, который возвращает общий `SsrStateService`. Используйте его, чтобы собирать состояние на сервере и восстанавливать его на клиенте. Сервис сам определяет окружение и на клиенте читает начальное состояние из `__INITIAL_STATE__`.

Изоморфная модель принимает сервис в конструкторе: на клиенте восстанавливает состояние через `extractState`, а на сервере регистрирует сериализатор через `addSerializer`.

```typescript
import { shallowRef, type ShallowRef } from 'vue';
import type { SsrStateService } from '@vue-modeler/di';

export class MyIsomorphicModel {
  protected _state: ShallowRef<Record<string, unknown>>;

  constructor(
    private ssrState: SsrStateService,
  ) {
    // Клиент: восстанавливаем состояние, сериализованное на сервере
    const stateFromServer = this.ssrState.extractState('myModelState') as
      | Record<string, unknown>
      | undefined;
    this._state = shallowRef(stateFromServer ?? {});

    // Сервер: регистрируем сериализатор, он будет вызван при гидрации
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

Разрешите сервис внутри фабрики и передайте в модель:

```typescript
import { provider, useSsrState } from '@vue-modeler/di';

const useMyModel = provider(() => new MyIsomorphicModel(useSsrState()));
```

Сервис предоставляет:

| Член | Описание |
|------|----------|
| `isServer` | `true` на сервере, `false` в браузере. |
| `extractState(key)` | Клиент: возвращает значение, сериализованное на сервере по ключу `key`. |
| `addSerializer(fn)` | Сервер: регистрирует сериализатор `() => ({ extractionKey, value })`. Возвращает тот же `fn`, чтобы позже его можно было удалить. |
| `removeSerializer(fn)` | Сервер: удаляет ранее добавленный сериализатор. |
| `injectState(target)` | Сервер: записывает сериализованное состояние в `target`, чтобы отправить его на клиент. |

Вне `setup` (например, в серверном entry-файле) не вызывайте `useSsrState()` напрямую — разрешите его через контейнер:

```typescript
import { useSsrState } from '@vue-modeler/di';

function ssrHydration(ctx: Context): void {
  const ssrStateService = app.$vueModelerDc.resolve(useSsrState);
  ssrStateService.injectState(ctx.state);
}
```

Полный поток от сервера к клиенту смотрите в разделе [Работа с SSR](/ru/advanced/ssr).

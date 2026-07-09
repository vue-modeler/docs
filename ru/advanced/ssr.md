---
title: Работа с SSR
description: Server-Side Rendering с контейнером зависимостей
outline: deep
---

::: tip
Контейнер предоставляет готовый `SsrStateService` через хук [`useSsrState`](/ru/advanced/predefined-hooks#usessrstate), включая полный пример изоморфной модели.
:::

[@vue-modeler/model](https://www.npmjs.com/package/@vue-modeler/model) не имеет отдельного хранилища состояния. Разработчик модели отвечает за процесс сериализации и десериализации состояния.

Реализация зависит от инфраструктуры, поэтому каждый может сделать это по-своему. Общая идея такая:

1. создаем сервис, который
    1. в контексте сервера принимает функцию сериализации
    1. в контексте клиента возвращает данные по ключу
1. Модель
    1. принимает сервис как зависимость
    1. В контексте сервера регистрирует в нем функцию сериализации
    1. В контексте клиента извлекает данные по ключу и инициализирует состояние  

Модель извлекает из сервиса ровно то, что сама туда положила через функцию сериализации.
Разработчик имеет полный контроль над форматом и содержанием передаваемых данных.

Модель не знает, как сервис сериализации передает данные с сервера на клиент.

## Пример реализации

Здесь представлена описанная выше идея в виде кода.

Вместо реализации сервиса описан его возможный интерфейс. Детали реализации зависят от инфраструктуры.

### Определяем изоморфную модель

```typescript

type Serializer  = () => {
    extractionKey: string,
    value: JsonObject,
}

interface SsrStateService {
  extractState: <T unknown>(key: string ) => T
  addSerializer: (f: Serializer) => void
  injectState: (originState: JsonObject) => JsonObject 
} 

class MyIsomorphicModel {
  protected _state: ShallowRef<Record<string, unknown>>;

  constructor(
    private api: Api,
    private ssrStateService: SsrStateService
  ) {
    // Восстанавливаем состояние с сервера
    const stateFromServer = ssrStateService.extractState<Record<string, unknown>>('myModelState');
    this._state = shallowRef(stateFromServer || {});

    // Регистрируем сериализатор для передачи на клиент
    this.ssrStateService.addSerializer(() => ({
      extractionKey: 'myModelState',
      value: this._state.value,
    }));

    this.init();
  }

  get state(): Readonly<Record<string, unknown>> {
    return this._state.value;
  }

  @action async init(): Promise<void> {
    if (this._state.value) {
      // состояние уже инициализировано
      return
    }
      
    this._state.value = await this.api.fetchState();
  }
}
```

### Использование в компоненте

```html
<template>
  <div>{{ model.state }}</div>
</template>

<script setup lang="ts">
import { useMyIsomorphicModel } from '@/providers/myIsomorphicModel';

const model = useMyIsomorphicModel();

// получаем состояние на стороне сервера.
// init запуститься в конструкторе 
// здесь просто ждем, когда выполнится 
onServerPrefetch(async () => model.init.promise)

// onMounted не нужен.
// На клиенте оно будет сразу в модели, потому что инициализация будет в конструкторе. 
</script>
```

### Гидрация состояния на сервере

Реализация гидрации зависит от инфраструктуры.

Допустим мы используем [@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di), поэтому это может выглядеть так.

```typescript
// На сервере
import { useSsrState } from '@vue-modeler/di';

function ssrHydration(ctx: Context): void {
  // извлекает сервис из контейнера 
  const ssrStateService = app.$vueModelerDc.get(useSsrState.asKey).instance;
  // вставляем состояние в контекст
  ctx.state = ssrStateService.injectState(ctx.state);
}
```

Дальше это состояние будет записано в какую-то глобальную переменную, которую можно прочитать на клиенте.

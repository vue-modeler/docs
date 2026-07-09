---
title: Быстрый старт
description: Пошаговое руководство по созданию первой модели с Vue Modeler
---

**Для быстрого старта сделаем простую задачу:** счетчик, который будет увеличиваться и уменьшаться при клике на кнопках `increment +` и `decrement -`. Изменение счетчика будет асинхронными действиями. Сделаем их долгими по 2 секунды. Во время выполнения действия, кнопки будут блокироваться. Дополнительно сделаем сброс счетчика в 0 по клику на кнопке `reset`.

Этого достаточно для демонстрации возможностей и преимущества перед другими библиотеками.

## 1. Определяем класс модели

`Counter` - стандартный класс унаследованный от `ProtoModel`, будет содержать свойство `_count` и методы `increment`, `decrement` и `reset`. Пометим их декоратором `@action`, чтобы они стали асинхронными действиями, и мы могли работать с ними как с реактивными объектами.

Наследование от `ProtoModel` обязательно, он содержит служебные методы. Подробнее здесь.

Зависимость от API сервиса будет передаваться в конструктор. Определяем для него интерфейс.

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

## 2. Делаем заглушку API сервиса

Сделаем здесь просто заглушку для имитации медленных асинхронных запросов.
Методы АПИ сервиса возвращают ошибки случайным образом. Это нужно, чтобы показать работу с ошибками в компоненте.

Ошибки можно обрабатывать и в действиях модели, если это нужно по бизнес логике. Но сейчас нам не нужно, поэтому ошибки не перехватываем.

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

## 3. Создаем модель и регистрируем в контейнере зависимостей

У каждого класса модели есть статический метод `model`, он создает модель.

Чтобы использовать модель в компоненте, нужно зарегистрировать её в контейнере зависимостей. Функция `provider` создает провайдер модели.

Провайдер модели это функция, которая создает модель при первом вызове, а при последующих возвращает готовый экземпляр. Подробнее здесь.

```typescript
// getting-started/di.ts
import { provider } from '@vue-modeler/di'
import { Counter } from './counter'
import { apiService } from './api-service'

export const useCounter = provider(() => Counter.model(apiService))
```

## 4. Используем модель в Vue компоненте

Получаем модель из контейнера привычным способом, через `const counter = useCounter`. Это похоже на обычный composable.

В компоненте максимально простой код, который отвечает только за отображение.  Вся бизнес логика в модели. Состояния и ошибки действий получаем из самих  действий.

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
      {{ counter.decrement.isPending ?   'decrement ...' : 'decrement -' }}
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

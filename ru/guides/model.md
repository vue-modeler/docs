---
title: Модель
description: Подробное руководство по созданию и использованию моделей в Vue Modeler
---

Модель объединяет состояние (данные) и поведение (действия) в единый реактивный объект, который автоматически управляет своими эффектами и очищает их при уничтожении.

::: tip
**Модель = данные + действия + реактивность + управление эффектами**
:::

## Основные понятия

В Vue Modeler существует четкая иерархия понятий, которые важно понимать для эффективной работы с моделями.

**ProtoModel** — это абстрактный базовый класс, который предоставляет фундаментальную функциональность для всех моделей. Это "движок" системы моделей, который:

- создает для каждой модели свой `EffectScope`;  
- преобразует методы с декораторами `@action` в действия и организует к ним доступ;  
- предоставляет единый конструктор моделей — статический метод `model`;  
- имеет встроенные методы `watch` и `computed`, которые регистрируют эффекты внутри локального EffectScope;  
- очищает эффекты при уничтожении модели.

**Класс модели** — это обычный класс, унаследованный от `ProtoModel`, который определяет структуру и поведение конкретной модели. Это "шаблон" для создания экземпляров моделей.

Класс модели определяет:

- **Структуру состояния**: какие данные хранит модель;  
- **Действия**: асинхронные методы помеченные декоратором `@action`, которые меняют состояние модели;  
- **Бизнес-логику**: правила и ограничения для работы с данными;  
- **Наблюдатели и вычисляемые свойства**: производные значения на основе состояния.

**Модель** — это shallow reactive объект со своим EffectScope, полученный из экземпляра класса, в котором действия — это исполняемые объекты со своим реактивным состоянием.

## Конструктор и создание модели

Чтобы создать модель определите конструктор и вызовите статический метод `model`.

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

// Это модель
const counterModel = Counter.model(new ApiService())

// Это экземпляр класса. НЕ модель.
const counter = new Counter(new ApiService())

```

::: tip
 Если вызвать конструктор через `new`, то вы получите экземпляр класса.  Экземпляр класса — это не модель, он не реактивен, и действия не объекты.  
:::

Метод `model` — универсальный именованный конструктор, он определен в `ProtoModel` и существует во всех классах модели.
`model` копирует сигнатуру конструктора класса, поэтому проверка типов в TS будет работать.

Под капотом `model` создает экземпляр класса и применяет к нему статический метод `createModel`. `createModel` — это фабрика модели. Она делает из экземпляра класса `shallowReactive` объект и оборачивает в прокси, который превращает действия в объекты.

Для особых случаев вы можете сделать свой именованный конструктор, как статический метод. У него будет своя сигнатура, в зависимости от контекста.

Чтобы новый конструктор возвращал модель, создайте  экземпляр класса и примените к нему статический метод `createModel`.

```typescript wrap=false {8,10,12}
// counter.ts
import { ProtoModel, action } from '@vue-modeler/model'

export class Counter extends ProtoModel {
  protected _count = 0

  static customFactoryModel(startValue: number, apiService: SomeApiService): Model<Counter> {
    // 1. создаем экземпляр класса
    const counter = new Counter(apiService)
    // 2. устанавливаем начальное значение
    counter._count = startValue
    // 3. делаем модель из экземпляра класса
    return Counter.createModel(counter)
  }

  constructor(
    private apiService: SomeApiService,
  ) {
    super()
  }
  ...
}

// 4. получаем модель двумя способами в зависимости от ситуации
const customCounter = Counter.customFactoryModel(10, new ApiService())
const defaultCounter = Counter.model(new ApiService())
```

## Уничтожение модели

Все модели имеют `destructor`, он определен в `ProtoModel`. Он удалит все эффекты и effect Scope.  Его нужно вызвать, когда модель больше не нужна. Если используете контейнер [@vue-modeler/di](https://www.npmjs.com/package/@vue-modeler/di), то не нужно беспокоиться: контейнер автоматически вызовет `destructor` и удалит модель, когда она не используется

Если нужны дополнительные операции при удалении, определите свой деструктор.

::: warning
 Обязательно вызывайте `super.destructor`, иначе получите утечки памяти
:::

## Свойства

Значение свойств — это и есть состояние модели, поэтому состояние неотделимо от модели. Нет отдельного хранилища состояния.

Публичные и защищенные свойства реактивны автоматически после создания модели, vue composition api не нужно использовать. Так происходит, потому что `model` — shallow reactive объект. Приватные свойства не будут реактивными.

Используйте vue composition api явно при создании свойств, если  

- собираетесь наблюдать за ними внутри класса модели,  
- нужна глубокая реактивность для сложных объектов,  
- нужна реактивность приватного свойства.

Делайте свойства защищенными, доступ открывайте через геттеры. Это позволит избежать прямых мутаций свойств и инкапсулировать состояние.

```typescript
// counter.ts
import { ProtoModel, action } from '@vue-modeler/model'

export class Counter extends ProtoModel {
  
  // Оба свойства будут реактивны в модели автоматически.
  // Использовать Vue Composition API не нужно.
  public value1 = 0
  protected _value2 = 0

  constructor(
    // это тоже свойство. Оно не будет реактивным, потому что приватное.
    private apiService: SomeApiService,
  ) {
    super()

    // Этот наблюдатель НЕ РАБОТАЕТ,
    // потому что в конструкторе this еще не shallow reactive
    this.watch(
      () => this.value1,
      () => {
        console.log('value1 changed', this.value1)
      }
    )
  }

  // Здесь this уже shallow reactive модель, 
  // поэтому this.value2 будет работать как реактивное свойство. 
  get value2(): number {
    return this._value2
  }
  ...
}

```

## Действия и методы

**Действие** — это объект, но определяется как асинхронный метод с декоратором `@action`, который меняет состояние и не возвращает данных.

Как работать с действиями внутри классов и снаружи смотрите раздел [Действия](/ru/guides/action).

## Наблюдатели

Наблюдателя создает метод `watch` — это обертка вокруг  vue composition API. Он создаст наблюдатель, привяжет эффект к effect scope модели, сохранит `stop handler` и вернёт его.
Сохранённый `stop handler` выполнится при уничтожении модели в деструкторе.

::: warning
 не используйте watch или computed напрямую из vue composition api. Это приведет к утечкам памяти.
:::

В модели есть 3 объекта для наблюдения:

- реактивные зависимости,  
- свойства,
- динамические модели.

**Для наблюдения за реактивными зависимостями или свойствами**  вызывайте `watch` в конструкторе. C реактивными зависимостями проблем не будет.  

Со свойствами есть одна сложность: в конструкторе this еще не shallow reactive, поэтому свойства еще не реактивны. Чтобы наблюдатель работал, нужно явно сделать свойство реактивным через vue composition api.

```typescript
// counter.ts
import { ref } from 'vue'
import { ProtoModel, action } from '@vue-modeler/model'

export class Counter extends ProtoModel {
  protected _count = 0
  protected _countForWatch = ref(0)
  
  constructor(
    someDependency: OtherReactiveObject,
    ...
  ) {
    super()

    // Этот наблюдатель НЕ РАБОТАЕТ,
    // потому что this в конструкторе еще не shallow reactive
    this.watch(
      () => this._count,
      () => {
        console.log('count changed', this._count)
      }
    )

    // Этот наблюдатель работает,
    // потому что this._countForWatch сразу реактивный
    this.watch(
      () => this._countForWatch,
      () => {
        console.log('countForWatch changed', this._countForWatch.value)
      }
    )
    
    // Этот наблюдатель работает,
    // потому что someDependency.someProperty сразу реактивный
    this.watch(
      () => someDependency.someProperty,
      () => {
        console.log('someDependency.someProperty changed', someDependency.someProperty)
      }
    )
  }
  ...
}
```

**Динамические модели** появляются, исчезают, меняются в процессе. Например,  
репозиторий загружает коллекцию dto, делает из dto коллекцию моделей, и следит за каждой моделью. Если у вас похожий случай, то:

1. вызовите `watch` после создания модели,
2. сохраните `stop handler`
3. вызовите `stop handler` при удалении модели из репозитория.

::: warning
 Если просто удалить модель, то наблюдатель останется и будет ссылаться на модель. Сборщик мусора не сможет её удалить.

 Обязательно выполняйте пункты 2 и  3, чтобы удалить наблюдатель, иначе будет утечка памяти.
:::

```typescript
// counter.ts
import { ref } from 'vue'
import { ProtoModel, action } from '@vue-modeler/model'

export class Repository extends ProtoModel {
  
  private _models: Set<Model<SomeModel>> = new Set()
  private _stopWatchers: Map<Model<SomeModel>, WatchStopHandle> = new Map()

  constructor(
    private fetchDtos: () => Promise<Dto[]>,
    private modelFactory: (dto: Dto) => Model<SomeModel>,
  ) {
    super()

    this.init()
  }
  ...

  @action async init(): Promise<void> {
    const dtos = await this.fetchDtos()
    for (const dto of dtos) {
      // 1. создаем модель
      const model = this.modelFactory(dto)
      // 2. создаем наблюдателя
      const stopWatcher = this.watch(
        () => model.property,
        () => {
          console.log('model changed', model)
        }
      })

      // 3. сохраняем модель
      this._models.add(model)
      // 4. сохраняем наблюдателя
      this._stopWatchers.set(model, stopWatcher)
    }
  }

  @action async destroyModel(model: Model<SomeModel>): Promise<void> {
    // 1. удаляем модель
    this._models.delete(model)
   
    const stopWatcher = this._stopWatchers.get(model)
    if (stopWatcher) {
      // 2. останавливаем наблюдение
      stopWatcher()
    }
    // 3. удаляем наблюдателя
    this._stopWatchers.delete(model)
  }

  destructor() {
    for (const [model, stopWatcher] of this._stopWatchers) {
      stopWatcher()
    }

    this._models.clear()
    this._stopWatchers.clear()
    super.destructor()
  }
}
```

## Наследование, полиморфизм

Класс модели — это стандартный класс, тут работают все подходы ООП. Действия родителей будут работать в потомках.

## Зависимости

Зависимости попадают в модель как аргументы конструктора. Здесь нет ограничений, это могут быть:

- компоненты инфраструктуры: АПИ сервисы, клиенты к БД  
- компоненты слоя UI: роутер, настройки UI  
- другие модели или хранилища: Pinia,  vuex, любые реактивные объекты

Модель не умеет внедрять зависимости, за это отвечает контейнер.

## Справочник API

Полное описание всех методов и свойств модели см. в разделе [API модели](/ru/api/proto-model).

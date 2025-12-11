# @tinkerbells/mobx-query

Библиотека для кеширования запросов.

Особенности:
- ⚡️️️️ Реактивный кэш на основе [mobx](https://mobx.js.org/)
- ️️️️️️⚡️️️️ Вдохновлено [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query/)
- ⚡️️️️ Декларативный способ описания queries и mutations
- ⚡️️️️ Реализация архитектурного подхода работы с данными [Astral Architecture Guide](https://guides.frontend.cloud.astral-dev.ru/docs/arch/intro)
- ⚡️️️️ Фоновая подгрузка данных для работы с WebSocket
- ⚡️️️️ Возможность тестирования

## Table of contents

- [Installation](#installation)
  - [Basic usage](#basic-usage)
  - [Core concepts](#core-concepts)
  - [QuerySet](#queryset)
    - [Создание QuerySet](#создание-queryset)
    - [Использование QuerySet](#использование-queryset)
    - [Синхронный вызов запроса данных](#синхронный-вызов-запроса-данных)
    - [Асинхронный вызов запроса данных](#асинхронный-вызов-запроса-данных)
    - [Автоматический запрос данных](#автоматический-запрос-данных)
  - [InfiniteQuerySet](#infinitequerygroups)
    - [Создание InfiniteQuerySet](#создание-infinitequerygroups)
    - [Использование InfiniteQuerySet](#использование-infinitequerygroups)
    - [Загрузка данных](#загрузка-данных)
    - [isEndReached. Определение конца списка](#isendreached-определение-конца-списка)
    - [Изменение количества запрашиваемых записей](#изменение-количества-запрашиваемых-записей)
  - [MutationSet](#mutationset)
    - [Создание mutations](#создание-и-использование-mutations)
    - [Синхронный вызов mutation](#синхронный-вызов-mutation)
    - [Асинхронный вызов mutation](#асинхронный-вызов-mutation)
    - [Best practices для MutationSet](#best-practices-для-mutationset)
  - [Кэширование QuerySet и InfiniteQuerySet](#кэширование-queryset-и-infinitequeryset)
    - [FetchPolicy](#fetchpolicy)
    - [Как работает кэш](#как-работает-кэш)
    - [Инвалидация кэша QuerySet](#инвалидация-кэша-queryset)
    - [Кастомная установка ключей кэширования](#кастомная-установка-ключей-кэширования)
  - [Фоновая загрузка данных QuerySet и InfiniteQuerySet](#фоновая-загрузка-данных-queryset-и-infinitequeryset)
  - [Изменение кэша QuerySet и InfiniteQuerySet](#изменение-кэша-queryset-и-infinitequeryset)
  - [Тестирование QuerySet и InfiniteQuerySet](#тестирование-queryset-и-infinitequeryset)
- [Core](#core)

## Installation

> Пакет публикуется в GitHub Packages. Убедитесь, что в `.npmrc` прописан `@tinkerbells:registry=https://npm.pkg.github.com/` и валидный `GITHUB_TOKEN`.

```bash
npm install @tinkerbells/mobx-query@alpha --save
```

```bash
yarn add @tinkerbells/mobx-query@alpha
```

## Basic usage

```
├── api/ 
|    ├── _fakers/
|    ├── endpoints/
|    ├── fetchers/
|    |    ├── docs.ts
|    |    └── index.ts
|    ├── services/
|    |    ├── CacheService/
|    |    |    ├── CacheService.ts
|    |    |    └── index.ts
|    |    └── index.ts
|    └── index.ts                         
```

Инициализация MobxQuery:
```api/services/CacheService/CacheService.ts```
```ts
import { MobxQuery } from '@tinkerbells/mobx-query';

// рекомендуется явно задавать параметры для MobXQuery
export const createCacheService = () =>
  new MobxQuery({ enableAutoFetch: true, fetchPolicy: 'cache-first' });

export const cacheService = createCacheService();
```

Определение fetcher и cacheGroups для docs:
```api/services/Fetcher/docs.ts```
```ts
const docsFetcher = {
  queries: {
    doc: cacheService.createQuerySet((id: string) => ({
      execute: () => docsEndpoints.getDoc(id).then(({ data }) => data),
    })),
  },
  infiniteQueries: {
    docList: cacheService.createInfiniteQuerySet(
      (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => ({
        execute: ({ offset, count }) =>
          docsEndpoint
            .getDocList({ offset, count, ...filters })
            .then(({ data }) => data.list),
      }),
    ),
  },
  mutations: {
    editDoc: cacheService.createMutationSet(
      (params: DocsDTO.EditDocInput) => docsEndpoints.editDoc(params),
    ),
  },
};

export type DocsFetcher = typeof docsFetcher;
```

Использование в store:

```ts
import { type DocsFetcher } from '@example/api';

class DocStore {
  constructor(
    private readonly _docID: string,
    private readonly _docsFetcher: DocsFetcher,
  ) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private get docQuery() {
    return this._docsFetcher.queries.doc.create(this.docID);
  }

  public get docName() {
    if (!this.docQuery.data) {
      return '';
    }

    return `Название документа: ${this.docQuery.data.name}`;
  }

  public get isLoading() {
    return this.docQuery.isLoading;
  }
  
  public get status() {
    return this.docQuery.status;
  }
}
```

```ts
class DocManagerStore {
  constructor(private readonly _docsFetcher: DocsFetcher) {}

  public changeOrg = () => {
    // инвалидирует все doc query, которые есть в кэше
    this._docsFetcher.queries.doc.invalidate();
  };
}
```

## Core concepts

[`Query`](#query) предназначен для получения данных. Не должен производить изменения.
[`QuerySet`](#queryset) - набор queries для данных, получаемых по одной и той же сущности с разными параметрами.
[`InfiniteQuery`](#infinitequery) предназначен для получения бесконечного списка данных.
[`Mutation`](#mutation) предназначен для изменения данных на сервере.
[`MutationSet`](#mutationset) - набор mutations для изменения данных. Необходим для консистенстности api с `QuerySet`.

`QuerySet`, `InfiniteQuerySet` и `MutationSet` создаются через методы MobxQuery:
- `createQuerySet`
- `createInfiniteQuerySet`
- `createMutationSet`

`Query`, `InfiniteQuery` и `Mutation` создаются через методы MobxQuery:
- `createQuery`
- `createInfiniteQuery`
- `createMutation`

Рекомендуется использовать именно Set'ы потому что это выскоуровневое api, скрывающее внутри себя сложность работы с кэшем и позволяющее работать с данными более декларативно. Set'ы используют внутри себя `Query`, `InfiniteQuery` и `Mutation`.

Методы `createQuery`, `createInfiniteQuery` и `createMutation` необходимо использовать для реализации собственных библиотек для работы с данными.

## QuerySet

[`Query`](#query) предназначен для получения данных. Не должен производить изменения.
`QuerySet` - набор queries для данных, получаемых по одной и той же сущности с разными параметрами.

### Создание QuerySet

В примере ниже будет создан doc query, который будет получать данные по id документа. После успешного выполнения запроса данные будут закэшированы.

```ts
const docsFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string) => ({
      execute: () => docsEndpoints.getDoc(id).then(({ data }) => data),
    })),
  },
};
```

### Использование QuerySet

Для получения объекта query необходимо вызвать метод `create`.
Параметры `create` полностью идентичны параметрам, указанным при определении query:
```ts
const docsFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string) => ({
      execute: () => docsEndpoints.getDoc(id).then(({ data }) => data),
    })),
  },
};

// create принимает только один параметр - id: string
const docQuery = docsFetcher.queries.doc.create('docID');
```

Метод `create` вернет [объект query](#query-interface), который содержит всю информацию по запросу и методы работы с запросом.

### Синхронный вызов запроса данных

Метод `sync` позволяет синхронно запустить запрос на получение данных:
```ts
const docQuery = docsFetcher.queries.doc.create(docID);

// есть callbacks на обработку success и error
docQuery.sync({
  onSuccess: (data) => {
    console.log(data);
  },
  onError: (error) => {
    console.log(error);
  },
});

// true
docQuery.isLoading;
```

### Асинхронный вызов запроса данных

Метод `async` позволяет асинхронно запустить запрос на получение данных:
```ts
const docQuery = docsFetcher.queries.doc.create(docID);

// передавать параметры запроса не нужно потому что они уже были переданы при вызове init
const response = await docQuery.async();

docQuery.isSuccess; // true
docQuery.data; // идентичен response
```

### Автоматический запрос данных

Если MobxQuery был создан с флагом `enableAutoFetch: true`, то данные будут автоматически запрошены при обращении к полю `data`:

```ts
const docQuery = docsFetcher.queries.doc.create(docID);

docQuery.data; // триггер запроса данных

docQuery.isLoading; // true
```

Если MobxQuery был создан с флагом `enableAutoFetch: false`, то автоматически запрос данных можно включить для текущего query:
```ts
const docQuery = docsFetcher.queries.doc.createWithConfig((
  { enableAutoFetch: true },
  docID
);

docQuery.data; // триггер запроса данных

docQuery.isLoading; // true
```

## InfiniteQuerySet

[`InfiniteQuery`](#infinitequery) предназначен для получения бесконечного списка данных.
`InfiniteQuerySet` - набор InfiniteQuery для данных, получаемых по одной и той же сущности с разными параметрами.

### Создание InfiniteQuerySet

В примере ниже будет создан docList InfiniteQuerySet. После успешного выполнения запроса данные будут закэшированы.

```ts
const docsFetcher = {
  infiniteQueries: {
    docList: mobxQuery.createInfiniteQuerySet(
      (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => ({
        execute: ({ offset, count }) =>
          docsEndpoint
            .getDocList({ offset, count, ...filters })
            .then(({ data }) => data.list),
      }),
    ),
  },
};
```

### Использование InfiniteQuerySet

Для получения объекта `InfiniteQuery` необходимо вызвать метод `create`.
Параметры `create` полностью идентичны параметрам, указанным при определении InfiniteQuery:
```ts
const docsFetcher = {
  infiniteQueries: {
    docList: mobxQuery.createInfiniteQuerySet(
      // Omit необходим для того, чтобы не передавать offset и count при вызове запроса из логики. Offset и count будут сформированы и переданы автоматически
      (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => ({
        execute: ({ offset, count }) =>
          docsEndpoint
            .getDocList({ offset, count, ...filters })
            // fetch должен возвращать array
            .then(({ data }) => data.list),
      }),
    ),
  },
};

// первым параметром create является - filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>
const docListQuery = docsFetcher.infiniteQueries.docList.create({ search: 'test' });
```

### Загрузка данных

```ts
import { when } from 'mobx';

const docListQuery = docsFetcher.infiniteQueries.docList.create({ search: 'test' });

await docListQuery.async(); // запрос на получение первых 30 записей

docListQuery.data.length; // 30 записей

docListQuery.fetchMore(); // запрос на получение следующих 30 записей

// ждем загрузки
await when(() => !query.isLoading);

docListQuery.data.length; // 60 записей
```

### `isEndReached`. Определение конца списка

Флаг `isEndReached` будет установлен в `true`, если записи для загрузки закончились:
```ts
import { when } from 'mobx';

const docListQuery = docsFetcher.infiniteQueries.docList.create({ search: 'test' });

await docListQuery.async(); // запрос на получение первых 30 записей

docListQuery.data.length; // 30 записей

docListQuery.fetchMore(); // запрос на получение следующих 30 записей

// ждем загрузки
await when(() => !query.isLoading);

docListQuery.data.length; // 19 записей. Последняя страница содержит 9 записей, а не 30, как было запрошено, значит больше данных нет

docListQuery.isEndReached; // true
```

Флаг `isEndReached` устанавливается в `true`, когда количество полученных элементов меньше запрошенного количества, что означает отсутствие дополнительных данных на сервере.

### Изменение количества запрашиваемых записей

Для изменения конфигурации InfiniteQuery необходимо использовать метод `createWithConfig`:
```ts
const docListQuery = docsFetcher.infiniteQueries.docList.createWithConfig(
  { incrementCount: 10, enabledAutoFetch: true },
  { search: 'test' },
);
```

[Интерфейс `InfiniteQueryConfig`](#интерфейс-infinitequeryconfig).

## MutationSet

[`Mutation`](#mutation) предназначен для отправки данных на сервер.
`MutationSet` - набор mutations, изменяющих одну и ту же сущность. Предоставляет интерфейс, идентичный `QuerySet`, для консистенстности api.

### Создание и использование MutationSet

В примере ниже будет создан `editDoc` mutation, который отправляет данные на сервер для редактирования документа:
```ts
const docsFetcher = {
  mutations: {
    editDoc: mobxQuery.createMutationSet((params: DocsDTO.EditDocInput) => docsEndpoints.editDoc(params)),
  },
};

const editDocMutation = docsFetcher.mutations.editDoc.create();

// params являются параметрами, указанными при определении mutation - DocsDTO.EditDocInput
await editDocMutation.async({ params: { id: 'docID', name: 'test' } });
```

Метод `create` вернет [объект mutation](#интерфейс-mutation), который содержит всю информацию по запросу и методы работы с запросом.

### Синхронный вызов mutation

Метод `sync` позволяет синхронно запустить запрос:
```ts
const editDocMutation = docsFetcher.mutations.editDoc.create();

// есть callbacks на обработку success и error
editDocMutation.sync({
  params: { id: 'docID', name: 'test' },
  onSuccess: (data) => {
    console.log(data);
  },
  onError: (error) => {
    console.log(error);
  },
});

// true
editDocMutation.isLoading;
```

### Асинхронный вызов mutation

Метод `async` позволяет асинхронно запустить запрос:
```ts
const editDocMutation = docsFetcher.mutations.editDoc.create();

await editDocMutation.async({ params: { id: 'docID', name: 'test' } });
```

### Best practices для MutationSet

#### `Mutation` должен создаваться в конструкторе класса, а не в getter

**✅ Valid**

```ts
class DocStore {
  private readonly creationDocMutation;

  public constructor(
    private readonly _docsFetcher: DocsFetcher,
  ) {
    this.creationDocMutation = this._docsFetcher.mutations.createDoc.create();
  }
}
```

**❌ Invalid**

```ts
class DocStore {
  private get creationDocMutation() {
    return this._docsFetcher.mutations.createDoc.create();
  }
}
```

Описанный кейс является антипаттерном потому что если на `creationDocMutation` больше не будет подписчиков, то при следующем обращении getter заново создаст `mutation`. Это может привести к нежелательным побочным эффектам.

## Кэширование QuerySet и InfiniteQuerySet

`QuerySet` и `InfiniteQuerySet` позволяет закэшировать данные, которые были получены ранее.

### FetchPolicy

`FetchPolicy` определяет политику получения данных.

Существует два типа политики:
- `cache-first` - если в кэше есть данные, они будут возвращены, если нет, то данные будут получены из сети, после чего ответ будет записан в кэш
- `network-only` - данные всегда берутся из сети, при этом ответ записывается в кэш

#### Глобальная установка fetchPolicy

Для глобальной установки конкретной политики fetchPolicy необходимо передать параметр `fetchPolicy` при создании `MobxQuery`:
```ts
import { MobxQuery } from 'mobx-query';

export const createQuery = () => new MobxQuery({ fetchPolicy: 'cache-first' });
```

#### Локальная установка fetchPolicy

Для каждого отдельного query можно установить свою fetchPolicy при инициализации.

Пример для `Query`:
```ts
const docQuery = docsFetcher.queries.doc.createWithConfig(({ fetchPolicy: 'network-only' }, 'docID');
```

Пример для `InfiniteQuery`:
```ts
const docListQuery = docsFetcher.infiniteQueries.docList.createWithConfig(
  { incrementCount: 10, fetchPolicy: 'network-only' },
  { search: 'test' },
);
```

#### Принцип работы fetchPolicy

`cache-first`:
```ts
const docQuery = docsFetcher.queries.doc.createWithConfig(({ fetchPolicy: 'cache-first' }, 'docID');

await docQuery.async(); // запрос будет выполнен потому что до этого запроса с такими параметрами не было

await docQuery.async(); // запрос не будет выполнен потому что данные уже есть в кэше. Promise будет завершен сразу
```

`network-only`:
```ts
const docQuery = docsFetcher.queries.doc.createWithConfig(({ fetchPolicy: 'network-only' }, 'docID');

await docQuery.async(); // запрос будет выполнен
await docQuery.async(); // запрос будет выполнен

const docQueryWithCache = docsFetcher.queries.doc.createWithConfig(({ fetchPolicy: 'cache-first' }, 'docID');

await docQueryWithCache.async(); // запрос не будет выполнен потому что прежде данные были получены с политикой `network-only` и записаны в кэш
```

### Как работает кэш

Все данные, возвращаемые `QuerySet` и `InfiniteQuerySet`, кэшируются в едином хранилище @tinkerbells/mobx-query.

При первом вызове `create` в хранилище создается запись с ключем, состоящим из:
- Хэш от функции конфигурации
- `queryParams`

Пример:
```ts
const docFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string, filters: { search: string }) => ({
      execute: () => docsEndpoints.getDoc(id, filters),
    })),
  },
};

// ключ кэша будет равен "12fj1d,doc,1,"{"search":"test"}""
// 12fj1d - это хэш от функции конфигурации
const docQuery = docFetcher.queries.doc.create('1', { search: 'test' });
// ключ кэша будет равен "12fj1d,doc,2,"{"search":"test2"}""
const docQuery = docsFetcher.queries.doc.create('1', { search: 'test2' });
```

#### Автоматическая чистка кэша

Mobx-query кэш организован через `WeekRef`, поэтому не используемые данные автоматически удаляются сборщиком мусора.

### Инвалидация кэша QuerySet и InfiniteQuerySet

Если данные в query стали неактуальными, то необходимо вызвать метод `invalidate`:
```ts
// инвалидация всех query с именем `doc`
docsFetcher.queries.doc.invalidate();
```

После вызова `invalidate` данные в кэше будут помечены как невалидные и при следующем обращении к query будет выполнен запрос на сервер. Если при вызове метода `invalidate` на изменения `.data` подписан любой store, то произойдет моментальный перезапрос активных query:

```ts
const docQuery = docsFetcher.queries.doc.create('docID');

await docQuery.async(); // данные записаны в кэш

docsFetcher.queries.doc.invalidate();

docQuery.data; // триггер запроса данных потому что они были помечены как невалидные
docQuery.isLoading; // true
```

#### Инвалидация всех query по их имени

Для инвалидации всех query по их имени можно вызвать метод `invalidate`:
```ts
const docQuery1 = docsFetcher.queries.doc.create('1');
const docQuery2 = docsFetcher.queries.doc.create('2');

docsFetcher.queries.doc.invalidate(); // данные docQuery1 и docQuery2 помечены как невалидные
```

#### Инвалидация query по частичному совпадению параметров

Если необходимо инвалидировать данные по конкретным параметрам, то их необходимо передать в метод `invalidate`:
```ts
const docsFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string) => ({
      execute: () => docsEndpoints.getDoc(id).then(({ data }) => data),
    })),
  },
};

docsFetcher.queries.doc.invalidate('1'); // документ с id = 1 будет помечен как невалидный
```

Параметры `invalidate` полностью совпадают с параметрами, описанными при определении query:

```ts
const docsFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string, search: string, filters: Filters) => ({
      execute: () => docsEndpoints.getDoc(id, search, filters),
    })),
  },
};

docsFetcher.queries.doc.invalidate('1', 'test', { sort: 'asc' });
```

#### Инвалидация query по частичному совпадению параметра-объекта

```ts
const docsFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet((id: string, filters: { sort: string; search: string }) => ({
      execute: () => docsEndpoints.getDoc(id, filters),
    })),
  },
};

const query1 = docsFetcher.queries.doc.create('1', { sort: 'asc', search: 'test' });
const query2 = docsFetcher.queries.doc.create('1', { sort: 'desc', search: 'test' });

docsFetcher.queries.doc.invalidate('1', { sort: 'asc' }); // данные только query1 будут помечены как невалидные
```

### Кастомная установка ключей кэширования

При определении `QuerySet` и `InfiniteQuerySet` можно указать параметр `keys` и `name`, которые будут использоваться для формирования ключей кэша.
- `name` - название набора. Будет использоваться вместо хэша от функции конфигурации
- `keys` - будут использоваться вместо параметров функции конфигурации

```ts
const docsFetcher = {
  queries: {
    doc: mobxQuery.createQuerySet(
      (id: string, search: string) => ({
        keys: [id],
        execute: () => docsEndpoints.getDoc(id, search),
      }),
      { name: 'doc' }
    ),
  },
};

// ключ кэша будет равен "doc,1"
const query = docsFetcher.queries.doc.create('1', 'test');

docsFetcher.queries.doc.invalidate('1'); // данные query будут помечены как невалидные
docsFetcher.queries.doc.invalidate('1', 'test'); // второй параметр будет проигнорирован
```

## Фоновая загрузка данных QuerySet и InfiniteQuerySet

Для фонового обновления данных возможно использовать флаг `isBackground` для query и infiniteQuery.
Данный метод хорошо подходит для инвалидации данных по событиям из WebSocket.

Пример для `QuerySet`:
```ts
const docQuery = docsFetcher.queries.doc.createWithConfig(({ isBackground: true }, 'docID');

docQuery.sync(); // запрос будет выполнен в фоновом режиме

docQuery.isLoading; // true. Первый запрос изменит статусные флаги

await when(() => docQuery.isSuccess);

docsFetcher.queries.doc.invalidate();

docQuery.isLoading; // false. При этом запрос данных уже выполняется в фоновом режиме, если где-то есть подписчик на изменения `.data`
docQuery.background.isLoading; // true
```

## Изменение кэша QuerySet и InfiniteQuerySet

Для изменения данных в кэше необходимо использовать `forceUpdate`, содержащийся в query:
```ts
const docQuery = docsFetcher.queries.doc.create('docID');

// в кэше будет записано "{ name: 'test' }", а статустные флаги перейдут в состояние 'success'
docQuery.forceUpdate({ name: 'test' });
```

Для массового изменения требуется использовать метод `forceUpdate` предоставляемый `QuerySet` или `InfiniteQuerySet`.
Первым аргументом является метод для анализа, и изменения данных. Начиная со второго, аргументы идентичны тем, что вы используете при созданнии и инвалидации.

```ts
const queryA = docsFetcher.queries.docsList.create(userId);
const queryB = docsFetcher.queries.docsList.create(userId, { isDesc: true });

docsFetcher.queries.docsList.forceUpdate(
  (currentData = []) => [...currentData, 'дополнительный элемент'], userId
);
console.log(queryA.data); // ['дополнительный элемент']
console.log(queryB.data); // ['дополнительный элемент']
```

## Синхронизация данных между вкладками

Для синхронизации данных между вкладками необходимо воспользоваться флагом `enabledSynchronization` при создании MobxQuery.
Тогда все query с совпадающими ключами на разных вкладках будут одновременно изменять свои данные

```ts
new MobxQuery({
  enabledSynchronization: true,
});
```

Для точечного управления синхронизацией, можно передавать флаг `enabledSynchronization` при создании query

```ts
docsFetcher.queries.document.createWithConfig({
  enabledSynchronization: true,
})
```

## Тестирование Fetcher на сонове QuerySet и InfiniteQuerySet.

Для мокинга QuerySet и InfiniteQuerySet необходимо использовать mock следующего вида:
```ts
type Fetcher = {
  queries: Record<string, QuerySet<any[], any>>;
  infiniteQueries: Record<InfiniteQuerySet<any[], any>>;
  mutations: Record<MutationSet<any, any>>;
};

const mockFetcher = <TFetcher extends Fetcher>(config: DeepPartial<TFetcher>) => config as TFetcher;
```

**Не используйте 'vitest-mock-extended' для мокинга Fetcher.**
Причина: `vitest-mock-extended` оборачивает объект в Proxy, что нарушает работу Mobx.

### Тестирование с включенным ```enabledAutoFetch```

```MobxQuery``` инициализируется с параметром: ```enabledAutoFetch```:
```ts
const createMobxQuery = () => new MobxQuery({
  enabledAutoFetch: true,
});
```

```booksFetcher.ts```
```ts
export const booksFetcher = {
  queries: {
    bookList: mobxQuery.createQuerySet((params: BooksDTO.BookListInput) => ({
      execute: () => booksEndpoint.getBookList(params),
    })),
  },
};

export type BooksFetcher = typeof booksFetcher;
```

```BooksListStore``` - использует `BooksFetcher` для получения данных:
```ts
class BooksListStore {
  public sort?: SortData;

  constructor(private readonly _booksFetcher: BooksFetcher) {
    makeAutoObservable(this);
  }

  private get listQuery() {
    return this._booksFetcher.queries.bookList.create(this.sort);
  }

  public get list(): ListItem[] {
    const data = this.listQuery.data || [];

    return data.map(({ id, name, price }) => ({
      id,
      name,
      price: formatPriceToView(price),
    }));
  }
}
```

Тест ```BooksListStore```:

```ts
import { when } from 'mobx';
import { mockCacheGroups } from '@tinkerbells/mobx-query-vitest-mock';

describe('BooksListStore', () => {
  it('Список книг форматируется для отображения', async () => {
    // Для каждого теста необходимо инициализировать свой instance MobxQuery,
    // в противном случае каждый тест будет модифицировать кэш
    const mobxQuery = createMobxQuery();

    const fakeBookList = makeFakeBookList(2, { price: 1000 });
    const fakeBookListItem = fakeBookList.data[0];

   const booksFetcherMock = mockFetcher<BooksFetcher>({
      queries: {
        bookList: () => mobxQuery.createQuerySet(() => ({
          execute: async () => fakeBookList,
        })),
      },
    });

    const sut = new BooksListStore(booksFetcherMock);

    // Ждем автоматической загрузки данных
    // Загрузка данных начнется автоматически при обращении к sut.list за счет параметра enabledAutoFetch
    await when(() => Boolean(sut.list?.length));

    expect(sut.list[0]).toEqual({
      id: fakeBookListItem.id,
      name: fakeBookListItem.name,
      price: '1 000 руб.',
    });
  });
});
```

## Core

Концепции, описанные ниже являются ядром библиотеки и используются внутри `QuerySet`, `InfiniteQuerySet` и `MutationSet`.

### Query

`Query` позволяет получать данные из API и кешировать их. Query не должны производить изменения.

#### Создание Query

В примере ниже будет создан doc query, который будет получать данные по id документа. После успешного выполнения запроса данные будут закэшированы.

```ts
const createDocQuery = (id: string) => 
  // первый параметр - ключи, по которому в кэше будет храниться ответ запроса
  cacheService.createQuery(['doc', id], 
    (params: { id: string }) => docsEndpoints.getDoc(params.id)
  ); 
```

#### Использование Query

```ts
const createDocQuery = (id: string) => 
  // первый параметр - ключи, по которому в кэше будет храниться ответ запроса
  cacheService.createQuery(['doc', id], 
    (params: { id: string }) => docsEndpoints.getDoc(params.id)
  ); 

const docQuery = createDocQuery('docID');
```

`docQuery` является объектом, который содержит всю информацию по запросу и методы работы с запросом:

#### Interface Query

```ts
export type Query<TResult = unknown, TError = unknown, TIsBackground = boolean> = {
  /**
   * Текущие данные запроса
   */
  data: TResult | undefined;

  /**
   * Флаг загрузки
   */
  isLoading: boolean;

  /**
   * Флаг успешного выполнения запроса
   */
  isSuccess: boolean;

  /**
   * Флаг наличия ошибки
   */
  isError: boolean;

  /**
   * Текущая ошибка
   */
  error: TError | undefined;

  /**
   * Флаг, обозначающий простаивание, т.е. запроса еще не было
   */
  isIdle: boolean;
  
  status: {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: TError | undefined;
    isIdle: boolean;
  }

  /**
   * Синхронизирует данные с сервером
   * @param onSuccess - Callback успешного выполнения
   * @param onError - Callback ошибки
   */
  sync: ({ onSuccess, onError }: SyncParams<TResult, TError>) => void;

  /**
   * Асинхронный метод получения данных
   */
  async: () => Promise<TResult>;

  /**
   * Метод инвалидации текущего query
   */
  invalidate: () => void;

  // Статусы, изменяющиеся после первого успешного запроса в режиме фоновой загрузки isBackground: true
  background: {
    /**
     * Флаг обозначающий загрузку данных в фоновом режиме
     */
    isLoading: boolean;

    /**
     * Флаг обозначающий, что последний запрос был зафейлен в фоновом режиме
     */
    isError: boolean;

    /**
     * Данные о последней ошибке в фоновом режиме
     */
    error?: TError;

    /**
     * Флаг, обозначающий успешность завершения последнего запроса в фоновом режиме
     */
    isSuccess: boolean;
  };
};
```

#### Синхронный вызов запроса данных

Метод `sync` позволяет синхронно запустить запрос на получение данных:
```ts
const createDocQuery = (id: string) => 
  // первый параметр - ключи, по которому в кэше будет храниться ответ запроса
  cacheService.createQuery(['doc', id], 
    (params: { id: string }) => docsEndpoints.getDoc(params.id)
  ); 

const docQuery = createDocQuery('docID');

// есть callbacks на обработку success и error
docQuery.sync({
  onSuccess: (data) => {
    console.log(data);
  },
  onError: (error) => {
    console.log(error);
  },
});

// true
docQuery.isLoading;
```

#### Асинхронный вызов запроса данных

Метод `async` позволяет асинхронно запустить запрос на получение данных:
```ts
const createDocQuery = (id: string) => 
  // первый параметр - ключи, по которому в кэше будет храниться ответ запроса
  cacheService.createQuery(['doc', id], 
    (params: { id: string }) => docsEndpoints.getDoc(params.id)
  ); 

const docQuery = createDocQuery('docID');

// передавать параметры запроса не нужно потому что они уже были переданы при вызове init
const response = await docQuery.async();

docQuery.isSuccess; // true
docQuery.data; // идентичен response
```

#### Автоматический запрос данных

Если MobxQuery был создан с флагом `enableAutoFetch: true`, то данные будут автоматически запрошены при обращении к полю `data`:
```ts
const cacheService = new MobxQuery({ enableAutoFetch: true });

const createDocQuery = (id: string) => 
  // первый параметр - ключи, по которому в кэше будет храниться ответ запроса
  cacheService.createQuery(['doc', id], 
    (params: { id: string }) => docsEndpoints.getDoc(params.id)
  ); 

docQuery.data; // триггер запроса данных

docQuery.isLoading; // true
```

Если MobxQuery был создан с флагом `enableAutoFetch: false`, то автоматически запрос данных можно включить для текущего query:
```ts
const createDocQuery = (id: string) => 
  cacheService.createQuery(['doc', id], 
    (params: { id: string }) => docsEndpoints.getDoc(params.id),
    { enableAutoFetch: true }
  ); 

docQuery.data; // триггер запроса данных

docQuery.isLoading; // true
```

### InfiniteQuery

`InfiniteQuery` предназначен для получения бесконечного списка данных.

### Создание InfiniteQuery

В примере ниже будет создан docList InfiniteQuery. После успешного выполнения запроса данные будут закэшированы.

```ts
const createDocListInfiniteQuery = (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => 
  cacheService.createInfiniteQuery(['docList', filters], 
    (params: { offset: number; count: number }) => docsEndpoints.getDocList({ offset: params.offset, count: params.count, ...filters })
  );
```

#### Использование InfiniteQuery

```ts
const createDocListInfiniteQuery = (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => 
  cacheService.createInfiniteQuery(['docList', filters], 
    (params: { offset: number; count: number }) => docsEndpoints.getDocList({ offset: params.offset, count: params.count, ...filters })
  );

// первым параметром create является - filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>
const docListQuery = createDocListInfiniteQuery({ search: 'test' });
```

#### Загрузка данных

```ts
import { when } from 'mobx';

const createDocListInfiniteQuery = (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => 
  cacheService.createInfiniteQuery(['docList', filters], 
    (params: { offset: number; count: number }) => docsEndpoints.getDocList({ offset: params.offset, count: params.count, ...filters })
  );

const docListQuery = createDocListInfiniteQuery({ search: 'test' });

await docListQuery.async(); // запрос на получение первых 30 записей

docListQuery.data.length; // 30 записей

docListQuery.fetchMore(); // запрос на получение следующих 30 записей

// ждем загрузки
await when(() => !query.isLoading);

docListQuery.data.length; // 60 записей
```

#### `isEndReached`. Определение конца списка

Флаг `isEndReached` будет установлен в `true`, если записи для загрузки закончились:
```ts
import { when } from 'mobx';

const createDocListInfiniteQuery = (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => 
  cacheService.createInfiniteQuery(['docList', filters], 
    (params: { offset: number; count: number }) => docsEndpoints.getDocList({ offset: params.offset, count: params.count, ...filters })
  );

const docListQuery = createDocListInfiniteQuery({ search: 'test' });

await docListQuery.async(); // запрос на получение первых 30 записей

docListQuery.data.length; // 30 записей

docListQuery.fetchMore(); // запрос на получение следующих 30 записей

// ждем загрузки
await when(() => !query.isLoading);

docListQuery.data.length; // 19 записей. Последняя страница содержит 9 записей, а не 30, как было запрошено, значит больше данных нет

docListQuery.isEndReached; // true
```

Флаг `isEndReached` устанавливается в `true`, когда количество полученных элементов меньше запрошенного количества, что означает отсутствие дополнительных данных на сервере.

#### Изменение количества запрашиваемых записей

Для изменения конфигурации InfiniteQuery необходимо использовать третий параметр `config`:
```ts
const createDocListInfiniteQuery = (filters: Omit<DocsDTO.DocListFilters, 'offset' | 'count'>) => 
  cacheService.createInfiniteQuery(['docList', filters], 
    (params: { offset: number; count: number }) => docsEndpoints.getDocList({ offset: params.offset, count: params.count, ...filters }),
    { incrementCount: 10 }
  );
```

#### Интерфейс InfiniteQueryConfig
```ts
export type InfiniteQueryConfig = {
  /**
   * Количество записей, которое будет загружено при первом и следующих запросах
   * @default 30
   */
  incrementCount?: number;
  /**
   * Обработчик ошибки
   */
  onError?: (error: unknown) => void;
  /**
   * Флаг, отвечающий за автоматический запрос данных при обращении к полю data
   */
  enabledAutoFetch?: boolean;
  /**
   * Политика кэширования данных.
   */
  fetchPolicy?: FetchPolicy;
  /**
   * Режим фонового обновления
   * @default false
   */
  isBackground?: boolean;
};
```

### Переодическая инвалидация (Поллинг)

Для обеспечения автоматической инвалидации данных по указанному времени используйте настройку `pollingTime` при создании query.
Значение необходимо указывать в милисекундах.

```ts
const TEN_MINUTES = 10 * 60 * 1000;

docsfetcher.queries.document.createWithConfig(
  {
    pollingTime: TEN_MINUTES,
  },
  documenId,
);

docsfetcher.infiniteQueries.list.createWithConfig(
  {
    pollingTime: TEN_MINUTES,
  },
);
```

### Mutation

`Mutation` предназначен для отправки данных на сервер с целью произведения изменений.

### Создание и использование mutations

В примере ниже будет создан `editDoc` mutation, который отправляет данные на сервер для редактирования документа:
```ts
const createEditDocMutation = (params: DocsDTO.EditDocInput) => 
  cacheService.createMutation((params: DocsDTO.EditDocInput) => docsEndpoints.editDoc(params));

const editDocMutation = createEditDocMutation();

// params являются параметрами, указанными при определении mutation - DocsDTO.EditDocInput
await editDocMutation.async({ params: { id: 'docID', name: 'test' } });
```

#### Интерфейс Mutation

```ts
type Mutation<TResult, TError = unknown, TExecutorParams = void> = {
  /**
   * Синхронный метод выполнения мутации
   */
  sync: (options: {
    onSuccess?: (res: TResult) => void;
    onError?: (e: TError) => void;
    params?: TExecutorParams;
  }) => void;

  /**
   * Асинхронный метод выполнения мутации
   */
  async: (params: TExecutorParams) => Promise<TResult>;

  /**
   * Флаг загрузки
   */
  isLoading: boolean;

  /**
   * Флаг успешного выполнения запроса
   */
  isSuccess: boolean;

  /**
   * Флаг наличия ошибки
   */
  isError: boolean;

  /**
   * Текущая ошибка
   */
  error: TError | null;

  /**
   * Флаг, обозначающий простаивание, т.е. запроса еще не было
   */
  isIdle: boolean;

  // Статусы, изменяющиеся после первого успешного запроса в режиме фоновой загрузки isBackground: true
  background: {
    /**
     * Флаг обозначающий загрузку данных в фоновом режиме
     */
    isLoading: boolean;

    /**
     * Флаг обозначающий, что последний запрос был зафейлен в фоновом режиме
     */
    isError: boolean;

    /**
     * Данные о последней ошибке в фоновом режиме
     */
    error?: TError;

    /**
     * Флаг, обозначающий успешность завершения последнего запроса в фоновом режиме
     */
    isSuccess: boolean;
  };
};
```

#### Синхронный вызов mutation

Метод `sync` позволяет синхронно запустить запрос:
```ts
const createEditDocMutation = (params: DocsDTO.EditDocInput) => 
  cacheService.createMutation((params: DocsDTO.EditDocInput) => docsEndpoints.editDoc(params));

const editDocMutation = createEditDocMutation();

// есть callbacks на обработку success и error
editDocMutation.sync({
  params: { id: 'docID', name: 'test' },
  onSuccess: (data) => {
    console.log(data);
  },
  onError: (error) => {
    console.log(error);
  },
});

// true
editDocMutation.isLoading;
```

##### Асинхронный вызов mutation

Метод `async` позволяет асинхронно запустить запрос:
```ts
const createEditDocMutation = (params: DocsDTO.EditDocInput) => 
  cacheService.createMutation((params: DocsDTO.EditDocInput) => docsEndpoints.editDoc(params));

const editDocMutation = createEditDocMutation();

await editDocMutation.async({ params: { id: 'docID', name: 'test' } });
```

### Особенности инвалидации Queries

Как при создании query, так и при инвалидации, нужно использовать массив ключей. Предполагается, что query может быть инвалидирован по нескольким ключам.

```ts
const query = mobxQuery.createQuery(
  ['key one', 'key two'], // ключ - массив строк
  () => Promise.resolve('foo'),
  { enabledAutoFetch: true }
);

mobxQuery.invalidate(['key two']); // query будет инвалидирован
mobxQuery.invalidate(['key one']); // query будет инвалидирован
```

Но, стоит учитывать, что ключом является цельный элемент массива, а не составляющие элемента.
```ts
const query = mobxQuery.createQuery(
  [['key one', 'key two']], // ключ - двумерный массив строк
  () => Promise.resolve('foo'),
  { enabledAutoFetch: true }
);

mobxQuery.invalidate(['key one']); // ключ не совпадает, query НЕ будет инвалидирован
```

Инвалидация будет происходить только для query, поле data которых считывается в данный момент. Для query, data которых будут отрендерены позже, запрос произойдет только в момент использования. Для превентивного обновления данных потребуется последовательное использование sync/async методов сразу после invalidate.

### Массовая инвалидация

Для инвалидации всех query необходимо использовать метод `invalidateQueries`:
```ts
mobxQuery.invalidateQueries();
```

### Изменение кэша

Для изменения данных в кэше необходимо использовать `forceUpdate`, содержащийся в query:
```ts
const query = mobxQuery.createQuery(['key'], () => Promise.resolve('1'));

// в кэше будет записано '2', а статустные флаги перейдут в состояние 'success'
query.forceUpdate('2');
```

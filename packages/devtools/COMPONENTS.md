# MobX Query DevTools - Структура компонентов

## Обзор архитектуры

DevTools построены с использованием атомарного подхода, где каждый компонент имеет единственную ответственность и может быть переиспользован.

## Структура папок

```
src/
├── components/
│   ├── ui/              # Базовые переиспользуемые UI компоненты
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Select.vue
│   │   ├── Checkbox.vue
│   │   ├── Badge.vue
│   │   ├── StatusDot.vue
│   │   ├── CodeBox.vue
│   │   └── JsonEditor.vue
│   │
│   └── devtools/        # Специфичные для devtools компоненты
│       ├── MobxQueryDevTools.vue      # Главный компонент
│       ├── QuerySidebar.vue           # Боковая панель со списком запросов
│       ├── QueryInspector.vue         # Инспектор для детального просмотра
│       ├── QueryStatusCounter.vue     # Счетчик статусов запросов
│       └── Explorer.vue               # Рекурсивный просмотр данных
│
├── core/                # Бизнес-логика
│   ├── store.ts         # MobX Store с сортировкой и фильтрацией
│   ├── adapter.ts       # Адаптер для MobX Query
│   └── models/
│       └── QueryModel.ts
│
└── styles.ts            # CSS стили
```

## UI Компоненты (components/ui/)

### Button.vue
Универсальная кнопка с вариантами:
- `variant`: `'primary'` | `'danger'` | `'default'`
- `size`: `'sm'` | `'md'`
- `disabled`: boolean

**Использование:**
```vue
<Button variant="primary" @click="handleClick">
  Refetch
</Button>
```

### Input.vue
Текстовое поле ввода с двусторонним биндингом:
- `modelValue`: string
- `placeholder`: string
- `type`: `'text'` | `'number'`

**Использование:**
```vue
<Input
  v-model="searchTerm"
  placeholder="Search..."
/>
```

### Select.vue
Выпадающий список:
- `modelValue`: string
- `options`: `Array<{ value: string, label: string }>`

**Использование:**
```vue
<Select
  v-model="sortBy"
  :options="sortOptions"
/>
```

### Checkbox.vue
Чекбокс с лейблом:
- `modelValue`: boolean
- `label`: string (optional)
- `disabled`: boolean

**Использование:**
```vue
<Checkbox v-model="isLoading">
  <span>Is Loading</span>
</Checkbox>
```

### Badge.vue
Бейдж для отображения тега:
- `variant`: `'default'` | `'success'` | `'error'` | `'warning'`

**Использование:**
```vue
<Badge variant="success">query</Badge>
```

### StatusDot.vue
Цветная точка для индикации статуса:
- `status`: `'success'` | `'error'` | `'fetching'` | `'idle'` | `'loading'`

**Использование:**
```vue
<StatusDot :status="getStatusColor(query)" />
```

### CodeBox.vue
Блок для отображения кода:
- `code`: string
- `variant`: `'default'` | `'error'`

**Использование:**
```vue
<CodeBox :code="JSON.stringify(data)" />
```

### JsonEditor.vue
Продвинутый редактор JSON с подсветкой синтаксиса и валидацией:
- `modelValue`: string | object | null
- `indent`: number (default: 2) - количество пробелов для отступа
- `withoutEdit`: boolean (default: false) - отключить редактирование
- `withoutError`: boolean (default: false) - скрыть сообщение об ошибке

**Возможности:**
- Подсветка синтаксиса для всех типов JSON (объекты, массивы, строки, числа, boolean, null)
- Автоматическое форматирование с настраиваемыми отступами
- Сохранение позиции каретки при редактировании
- Валидация JSON в реальном времени
- Автоматическое применение изменений через v-model
- ContentEditable подход для плавного редактирования

**Использование:**
```vue
<JsonEditor
  :model-value="query.data"
  @update:model-value="handleDataUpdate"
  :indent="2"
/>
```

## DevTools Компоненты (components/devtools/)

### MobxQueryDevTools.vue
Главный компонент DevTools. Управляет:
- Показом/скрытием панели
- Изменением размера панели (drag & drop)
- Сохранением настроек в localStorage

### QuerySidebar.vue
Боковая панель со списком запросов. Включает:
- Фильтрацию запросов
- Сортировку (по статусу, ключу, времени обновления)
- Счетчик статусов
- Список запросов с индикаторами статуса

### QueryInspector.vue
Детальный просмотр выбранного запроса. Включает:
- Информацию о ключе запроса
- Состояние (isLoading, isSuccess, isError)
- Данные запроса (режимы Explorer и JSON)
- Ошибки
- Действия (Refetch, Fetch more, Invalidate)

### QueryStatusCounter.vue
Компактный счетчик статусов запросов:
- Fresh (успешные и актуальные)
- Fetching (в процессе загрузки)
- Stale (устаревшие)
- Error (с ошибками)

### Explorer.vue
Рекурсивный компонент для просмотра сложных данных:
- Поддержка объектов, массивов, примитивов
- Раскрытие/сворачивание вложенных структур
- Подсветка типов данных
- Подсчет элементов

## Функционал Store (core/store.ts)

### Сортировка
```typescript
type SortOption = 'status' | 'queryKey' | 'lastUpdated';
type SortOrder = 'asc' | 'desc';
```

Методы:
- `setSortBy(sortBy: SortOption)`
- `setSortOrder(sortOrder: SortOrder)`
- `toggleSortOrder()`

### Фильтрация
- `setSearch(term: string)` - фильтрация по ключу запроса
- `filteredQueries` - computed свойство с отфильтрованными и отсортированными запросами

### Приоритеты сортировки по статусу
1. Loading (в процессе)
2. Error (с ошибкой)
3. Stale (устаревшие)
4. Success (успешные)
5. Остальные

## Отличия от TanStack Query DevTools

### Перенесенные элементы:
✅ Explorer для рекурсивного просмотра данных
✅ QueryStatusCounter со счетчиками Fresh/Fetching/Stale/Error
✅ Сортировка запросов (по статусу, ключу, времени)
✅ Система токенов стилей
✅ Фильтрация запросов
✅ Переключение режимов просмотра данных (Explorer/JSON)

### Адаптации:
- Убраны Mutations (не поддерживаются в MobX Query)
- Убран Picture-in-Picture режим
- Упрощена тема (только dark mode)
- Адаптирован под MobX Query API

## Примеры использования

### Базовое использование
```typescript
import { mountMobxQueryDevtools } from '@tinkerbells/mobx-query-devtools';
import { mobxQuery } from './mobx-query-instance';

// Монтирование DevTools
const unmount = mountMobxQueryDevtools(mobxQuery);

// Размонтирование (опционально)
unmount();
```

### Кастомная цель монтирования
```typescript
const container = document.getElementById('custom-container');
mountMobxQueryDevtools(mobxQuery, container);
```

## Стили и темы

Все стили используют CSS переменные, определенные в `styles.ts`:
- `--mq-bg-main` - основной фон
- `--mq-bg-panel` - фон панелей
- `--mq-bg-hover` - фон при наведении
- `--mq-border` - цвет границ
- `--mq-text-main` - основной текст
- `--mq-text-muted` - приглушенный текст
- `--mq-primary` - основной цвет (синий)
- `--mq-success` - успех (зеленый)
- `--mq-error` - ошибка (красный)
- `--mq-fetching` - загрузка (синий)
- `--mq-idle` - неактивный (серый)

## Дальнейшие улучшения

Возможные улучшения:
- [ ] Поддержка светлой темы
- [ ] Экспорт/импорт данных запросов
- [ ] История действий (Timeline)
- [ ] Metrics и статистика
- [ ] Настройка горячих клавиш
- [ ] Поддержка мобильных устройств

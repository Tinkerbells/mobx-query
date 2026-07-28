# Список изменений для адаптации UI под mobx-query

## Критичные изменения (УДАЛИТЬ)

### 1. Скрыть вкладку Mutations

**Файл:** `src/tanstack/Devtools.tsx`

**Места:**
- Строка 622: `const [selectedView, setSelectedView] = createSignal<'queries' | 'mutations'>('queries')`
  - Заменить на: `const [selectedView, setSelectedView] = createSignal<'queries'>('queries')`

- Строки 812-820: RadioGroup.Item для Mutations - **УДАЛИТЬ** весь блок

- Строки 827-829: MutationStatusCount - **УДАЛИТЬ** весь блок

- Строки 879-888: Фильтр для mutations - **УДАЛИТЬ** весь блок

- Строки 1275-1293: Список mutations - **УДАЛИТЬ** весь блок

### 2. Удалить фильтр "Hide Disabled Queries"

**Файл:** `src/tanstack/Devtools.tsx`

**Места:**
- Строки 666, 678-679: Логика фильтрации - **УДАЛИТЬ** блок if
- Строки 1188-1255: UI для настройки - **УДАЛИТЬ** весь DropdownMenu.Sub блок

### 3. Удалить индикаторы isStale, isPaused, isStatic

Все эти методы не поддерживаются в mobx-query.

---

## Обновления в Bridge

**Файл:** `src/components/devtools/MobxQueryDevTools.tsx`

См. детали в файле COMPARISON.md

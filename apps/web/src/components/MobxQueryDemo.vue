<script setup lang="ts">
import { Observer } from 'mobx-vue-lite';
import { todoStore } from '../stores/todo-store';

const store = todoStore;

const handleIdInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);

  store.setId(value);
};
</script>

<template>
  <Observer>
    <section class="demo">
      <header class="demo__header">
        <div>
          <p class="demo__eyebrow">Пример использования @tinkerbells/mobx-query</p>
          <h1>Запрос одного todo с кешем</h1>
          <p class="demo__lead">
            При первом обращении к данным с выбранным id MobxQuery выполнит запрос и положит ответ в кеш.
            Повторное обращение к тому же id вернёт данные из кеша, пока вы явно не инвалидируете их.
          </p>
          <p class="demo__hint">В CacheService включён enabledAutoFetch, поэтому данные подтянутся при первом чтении
            data.</p>
        </div>
      </header>

      <div class="panel">
        <div class="controls">
          <label class="field">
            <span>Todo ID (1–200):</span>
            <input type="number" min="1" max="200" :value="store.currentId" @input="handleIdInput" />
          </label>

          <div class="buttons">
            <button type="button" @click="store.next(-1)">Предыдущий</button>
            <button type="button" @click="store.next(1)">Следующий</button>
            <button type="button" @click="store.load" :disabled="store.isLoading">Запросить</button>
            <button type="button" class="secondary" @click="store.invalidateCurrent">Инвалидировать кэш</button>
          </div>

          <p class="cache" :class="{ 'cache--hit': store.isCached }">
            {{ store.isCached ? 'В кэше уже есть данные для этого id' : 'Запрос ещё не делали — кэш пуст' }}
          </p>
        </div>

        <div class="result">
          <p v-if="store.isLoading">Загружаем данные...</p>
          <p v-else-if="store.isError" class="error">Ошибка: {{ store.errorMessage }}</p>
          <div v-else-if="store.todo">
            <p class="result__id">ID: {{ store.todo.id }}</p>
            <h2 class="result__title">{{ store.todo.title }}</h2>
            <p class="result__meta">
              Пользователь: {{ store.todo.userId }} · Статус:
              <strong>{{ store.todo.completed ? 'готово' : 'в работе' }}</strong>
            </p>

            <div class="mutations">
              <button type="button" @click="store.toggleComplete" :disabled="store.isMutating">
                {{ store.todo.completed ? 'Отметить как в работе' : 'Отметить как готово' }}
              </button>
              <p class="mutations__status">
                {{ store.mutationMessage }}
                <span v-if="store.mutationError" class="error">
                  {{ store.mutationError instanceof Error ? store.mutationError.message : store.mutationError }}
                </span>
              </p>
            </div>
          </div>
          <p v-else>Запрос ещё не выполнялся.</p>
        </div>
      </div>

      <footer class="footer">
        <p>Попробуйте походить по id и вернуться назад — данные из кэша появятся без спиннера. Нажмите «Инвалидировать
          кэш», чтобы форсировать повторный запрос.</p>
      </footer>
    </section>
  </Observer>
</template>

import { makeAutoObservable } from 'mobx';
import type { Query } from '@tinkerbells/mobx-query';
import { cacheService } from './cache';

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const todoFetcher = {
  queries: {
    todo: cacheService.createQuerySet((id: number) => ({
      // Ключ используется для кеширования и инвалидации
      keys: ['todo', id],
      execute: async () => {
        await delay(750);
        return createFakeTodo(id);
      },
    })),
  },
};

const MIN_ID = 1;
const MAX_ID = 200;

export class TodoStore {
  public currentId = 1;
  public seenIds: number[] = [1];
  private readonly toggleMutation = cacheService.createMutationSet(async (id: number) => {
    await delay(600);
    return { id };
  });
  private readonly toggle = this.toggleMutation.create();

  public constructor(private readonly fetcher = todoFetcher) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public get todoQuery() {
    return this.fetcher.queries.todo.create(this.currentId);
  }

  public get todo() {
    return this.todoQuery.data;
  }

  public get isLoading() {
    return this.todoQuery.isLoading;
  }

  public get isError() {
    return this.todoQuery.isError;
  }

  public get errorMessage() {
    const { error } = this.todoQuery;

    if (!error) {
      return '';
    }

    return error instanceof Error ? error.message : String(error);
  }

  public get isCached() {
    return cacheService.getExistsQueries(['todo', this.currentId]).length > 0;
  }

  public get cacheSnapshot() {
    return this.seenIds
      .map((id) => {
        const [query] = cacheService.getExistsQueries(['todo', id]) as Query<Todo>[];

        if (!query) {
          return null;
        }

        return {
          id,
          status: query.status,
          data: query.data,
          query,
          // background доступен только при isBackground: true, поэтому снимем жёсткую типизацию
          background: ((query as any).background ?? null) as Record<string, unknown> | null,
        };
      })
      .filter(Boolean) as Array<{
      id: number;
      status: Query<Todo>['status'];
      data?: Todo;
      query: Query<Todo>;
      background: Record<string, unknown> | null;
    }>;
  }

  public get mutation() {
    return this.toggle;
  }

  public get isMutating() {
    return this.toggle.isLoading;
  }

  public get mutationError() {
    return this.toggle.error;
  }

  public get mutationMessage() {
    if (this.isMutating) return 'Сохраняем...';
    if (this.toggle.isSuccess) return 'Статус сохранён (имитация)';
    if (this.toggle.isError) return 'Ошибка при сохранении';
    return '';
  }

  public setId(id: number) {
    if (!Number.isFinite(id)) {
      return;
    }

    const safeId = Math.min(Math.max(Math.round(id), MIN_ID), MAX_ID);

    this.currentId = safeId;
    this.trackId(safeId);
  }

  public next(delta = 1) {
    this.setId(this.currentId + delta);
  }

  public async load() {
    return this.todoQuery.async();
  }

  public invalidateCurrent() {
    this.fetcher.queries.todo.invalidate(this.currentId);
  }

  public async toggleComplete() {
    const nextCompleted = !this.todo?.completed;

    this.toggle.sync({
      params: this.currentId,
      onSuccess: () => {
        this.fetcher.queries.todo.forceUpdate(
          (current) => {
            const base = current ?? createFakeTodo(this.currentId);
            return { ...base, completed: nextCompleted };
          },
          this.currentId,
        );
      },
      onError: () => {
        /* noop for demo */
      },
    });
  }

  private trackId(id: number) {
    if (!this.seenIds.includes(id)) {
      this.seenIds.push(id);
    }
  }
}

export const todoStore = new TodoStore();
export type TodoFetcher = typeof todoFetcher;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createFakeTodo = (id: number): Todo => ({
  id,
  userId: (id % 5) + 1,
  title: `Задача #${id} (имитация API)`,
  completed: id % 2 === 0,
});

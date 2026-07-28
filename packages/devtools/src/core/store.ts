import { makeAutoObservable, runInAction } from 'mobx';

import type { DevToolsAdapter } from './adapter';
import { QueryModel } from './models/QueryModel';
import type { MobxQueryDevtoolsEvent } from '@tinkerbells88/mobx-query';

export type SortOption = 'status' | 'queryKey' | 'lastUpdated';
export type SortOrder = 'asc' | 'desc';

export class DevToolsStore {
  public isOpen: boolean;
  public searchTerm: string;
  public selectedQueryHash: string | null;
  public queryModels: QueryModel[];
  public sortBy: SortOption;
  public sortOrder: SortOrder;
  public events: MobxQueryDevtoolsEvent[];

  private unsubscribe?: () => void;
  private readonly adapter: DevToolsAdapter;

  constructor(adapter: DevToolsAdapter) {
    this.adapter = adapter;
    this.isOpen = false;
    this.searchTerm = '';
    this.selectedQueryHash = null;
    this.queryModels = [];
    this.sortBy = 'status';
    this.sortOrder = 'asc';
    this.events = this.adapter.events();

    makeAutoObservable(this, {}, { autoBind: true });
    this.sync();
    this.startListening();
  }

  public destroy() {
    this.stopListening();
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) this.sync();
  }

  public setSearch(term: string) {
    this.searchTerm = term;
  }

  public selectQuery(hash: string) {
    this.selectedQueryHash = hash;
  }

  public setSortBy(sortBy: SortOption) {
    this.sortBy = sortBy;
  }

  public setSortOrder(sortOrder: SortOrder) {
    this.sortOrder = sortOrder;
  }

  public toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  public get activeQuery() {
    return (
      this.queryModels.find((model) => model.hash === this.selectedQueryHash) ??
      null
    );
  }

  public get queries() {
    return this.queryModels;
  }

  public get filteredQueries() {
    let filtered = this.queryModels;

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((model) =>
        JSON.stringify(model.key).toLowerCase().includes(term),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'status':
          comparison = this.compareByStatus(a, b);
          break;
        case 'queryKey':
          comparison = JSON.stringify(a.key).localeCompare(JSON.stringify(b.key));
          break;
        case 'lastUpdated':
          // mobx-query не хранит время обновления, используем хеш для стабильной сортировки
          comparison = a.hash.localeCompare(b.hash);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  private compareByStatus(a: QueryModel, b: QueryModel): number {
    const getStatusPriority = (model: QueryModel) => {
      if (model.isLoading) return 0;
      if (model.isError) return 1;
      if (model.isStale) return 2;
      if (model.isSuccess) return 3;
      return 4;
    };

    return getStatusPriority(a) - getStatusPriority(b);
  }

  public sync() {
    const snapshots = this.adapter.list();
    const map = new Map(this.queryModels.map((m) => [m.hash, m]));

    const nextModels = snapshots.map(({ hash, key, type, query, meta }) => {
      const existing = map.get(hash);

      if (existing) {
        existing.updateQuery(query, type, meta);
        return existing;
      }

      return new QueryModel(hash, key, type, query, meta);
    });

    runInAction(() => {
      this.queryModels = nextModels;

      if (
        this.selectedQueryHash &&
        !nextModels.some((model) => model.hash === this.selectedQueryHash)
      ) {
        this.selectedQueryHash = nextModels[0]?.hash ?? null;
      }

      if (!this.selectedQueryHash && nextModels.length > 0) {
        const first = nextModels[0];
        this.selectedQueryHash = first ? first.hash : null;
      }
    });
  }

  public syncEvents() {
    this.events = this.adapter.events();
  }

  private startListening() {
    if (this.unsubscribe) return;
    this.unsubscribe = this.adapter.subscribe(() => {
      this.sync();
      this.syncEvents();
    });
  }

  private stopListening() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}

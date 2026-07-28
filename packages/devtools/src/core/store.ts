import { makeAutoObservable, runInAction } from 'mobx';

import type { DevToolsAdapter } from './adapter';
import { QueryModel } from './models/QueryModel';

export class DevToolsStore {
  public isOpen: boolean;
  public searchTerm: string;
  public selectedQueryHash: string | null;
  public queryModels: QueryModel[];

  private unsubscribe?: () => void;
  private readonly adapter: DevToolsAdapter;

  constructor(adapter: DevToolsAdapter) {
    this.adapter = adapter;
    this.isOpen = false;
    this.searchTerm = '';
    this.selectedQueryHash = null;
    this.queryModels = [];

    makeAutoObservable(this, {}, { autoBind: true });
    this.sync();
  }

  public destroy() {
    this.stopListening();
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.sync();
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  public setSearch(term: string) {
    this.searchTerm = term;
  }

  public selectQuery(hash: string) {
    this.selectedQueryHash = hash;
  }

  public get activeQuery() {
    return (
      this.queryModels.find((model) => model.hash === this.selectedQueryHash) ??
      null
    );
  }

  public get filteredQueries() {
    if (!this.searchTerm) {
      return this.queryModels;
    }

    const term = this.searchTerm.toLowerCase();

    return this.queryModels.filter((model) =>
      JSON.stringify(model.key).toLowerCase().includes(term),
    );
  }

  public sync() {
    const snapshots = this.adapter.list();
    const map = new Map(this.queryModels.map((m) => [m.hash, m]));

    const nextModels = snapshots.map(({ hash, key, type, query }) => {
      const existing = map.get(hash);

      if (existing) {
        existing.updateQuery(query, type);
        return existing;
      }

      return new QueryModel(hash, key, type, query);
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

  private startListening() {
    if (this.unsubscribe) return;

    this.unsubscribe = this.adapter.subscribe(this.sync);
  }

  private stopListening() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}

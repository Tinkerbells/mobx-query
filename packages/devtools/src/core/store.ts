import { makeAutoObservable, runInAction } from 'mobx';

import type { DevToolsAdapter } from './adapter';
import { QueryModel } from './models/QueryModel';

const SYNC_INTERVAL = 1000;

export class DevToolsStore {
  public isOpen: boolean;
  public searchTerm: string;
  public selectedQueryHash: string | null;
  public queryModels: QueryModel[];

  private syncTimer?: number;
  private readonly adapter: DevToolsAdapter;

  constructor(adapter: DevToolsAdapter) {
    this.adapter = adapter;
    this.isOpen = false;
    this.searchTerm = '';
    this.selectedQueryHash = null;
    this.queryModels = [];

    makeAutoObservable(this, {}, { autoBind: true });
    this.sync();
    this.startSyncLoop();
  }

  public destroy() {
    this.stopSyncLoop();
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.sync();
      this.startSyncLoop();
    } else {
      this.stopSyncLoop();
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

    const nextModels = snapshots.map(({ hash, key, instance }) => {
      const existing = map.get(hash);

      if (existing) {
        existing.updateInstance(instance as never);
        return existing;
      }

      return new QueryModel(hash, key, instance as never);
    });

    runInAction(() => {
      this.queryModels = nextModels;

      if (this.selectedQueryHash && !this.adapter.has(this.selectedQueryHash)) {
        this.selectedQueryHash = nextModels[0]?.hash ?? null;
      }

      if (!this.selectedQueryHash && nextModels.length > 0) {
        const first = nextModels[0];
        this.selectedQueryHash = first ? first.hash : null;
      }
    });
  }

  private startSyncLoop() {
    if (this.syncTimer) return;

    this.syncTimer = window.setInterval(this.sync, SYNC_INTERVAL);
  }

  private stopSyncLoop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }
}

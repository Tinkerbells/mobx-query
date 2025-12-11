import { observable, action, computed, makeObservable } from 'mobx';

export class CounterStore {
  @observable
  count = 0;

  constructor() {
    makeObservable(this);
  }

  @action
  inc() {
    this.count++;
  }

  @action
  dec() {
    this.count--;
  }

  @computed
  get double() {
    return this.count * 2;
  }
}

export const counterStore = new CounterStore()
